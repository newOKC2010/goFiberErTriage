package er

import (
	"log"
	"os"
	"time"

	"github.com/lib/pq"

	mophAlert "tiage/controller/alert"
	"tiage/controller/utils"
)

// ── NULL TYPE (ปิดไว้ชั่วคราว) ──────────────────────────────────────────────
/*
func checkNullAndBroadcast() {
	list, err := GetNullTypePatients()
	if err != nil {
		log.Printf("[NULL] query error: %v", err)
		return
	}
	if len(list) > 0 {
		log.Printf("[NULL] ══════ ยังไม่ระบุ type %d ราย ══════", len(list))
		for _, a := range list {
			log.Printf("[NULL] HN:%-8s  รอ %3d นาที  %s", a.HN, a.ElapsedMin, a.FullName)
			go mophAlert.SendNullTypeAlert(a.HN, a.FullName, a.EnterERDate, a.EnterERTime, a.ElapsedMin)
		}
	}
	NullHub.broadcast(list)
}
*/

func checkAndBroadcast() {
	list, err := GetPendingERAlerts()
	if err != nil {
		log.Printf("[ALERT] query error: %v", err)
		return
	}

	vns := make([]string, 0, len(list))
	for _, a := range list {
		vns = append(vns, a.VN)
	}
	discharged, err := AutoClearDischargedAlerts(vns)
	if err != nil {
		log.Printf("[ALERT] auto-clear error: %v", err)
	}
	for vn := range discharged {
		log.Printf("[ALERT] auto-clear (discharged) vn=%s", vn)
	}

	// ส่ง card ที่ยัง active ทั้งหมดทุกรอบ (vn ที่ไม่อยู่ในรายการ = frontend ลบ card)
	alerts := []utils.ERAlert{}
	for _, a := range list {
		if discharged[a.VN] {
			continue
		}
		threshold, ok := utils.AlertThresholds[a.EmergencyType]
		if !ok || threshold <= 0 {
			continue
		}
		elapsed := a.ElapsedMin
		a.ThresholdMin = threshold
		// ถึงรอบใหม่เมื่อรอบปัจจุบันมากกว่ารอบที่แจ้งล่าสุด (ไม่ข้ามรอบ ไม่แจ้งซ้ำ)
		a.Alert = elapsed >= threshold && elapsed/threshold > a.LastAlertMin/threshold
		if a.Alert {
			log.Printf("[ALERT] HN:%-8s  รอ %3d/%d นาที  [%s]  %s",
				a.HN, elapsed, threshold, a.EmergencyName, a.FullName)
			UpdateLastAlertAt(a.VN)
			go mophAlert.SendERAlert(a.HN, a.FullName, a.EmergencyName,
				a.EnterERDate, a.EnterERTime, elapsed, threshold)
		}
		if a.Alert || a.Alerted {
			alerts = append(alerts, a)
		}
	}
	Hub.broadcast(alerts)
}

func InitERListener() {
	var connStr string
	if os.Getenv("SELECT_START_DB") == "DEV" {
		connStr = os.Getenv("DB_URL_DEV")
	} else {
		connStr = os.Getenv("DB_URL_PROD")
	}

	listener := pq.NewListener(connStr, 5*time.Second, time.Minute,
		func(ev pq.ListenerEventType, err error) {
			switch ev {
			case pq.ListenerEventConnected:
				log.Println("[LISTEN] เชื่อมต่อ listener สำเร็จ ✓")
			case pq.ListenerEventReconnected:
				log.Println("[LISTEN] reconnect สำเร็จ ✓")
			case pq.ListenerEventDisconnected:
				log.Printf("[LISTEN] หลุดการเชื่อมต่อ กำลัง reconnect... error: %v", err)
			}
		},
	)

	if err := listener.Listen("er_alert_update"); err != nil {
		log.Fatalf("[LISTEN] ไม่สามารถ listen ได้: %v", err)
	}
	log.Println("[LISTEN] กำลัง listen channel 'er_alert_update' ✓")

	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()

		log.Println("[ALERT] ตรวจสอบผู้ป่วยค้างจากก่อน restart...")
		checkAndBroadcast()
		// checkNullAndBroadcast() // ปิดไว้ชั่วคราว

		for {
			select {
			case n, ok := <-listener.Notify:
				if !ok {
					log.Println("[LISTEN] channel ปิด หยุดการทำงาน")
					return
				}
				log.Printf("[LISTEN] รับ notify: vn=%s", n.Extra)
				checkAndBroadcast()
				// checkNullAndBroadcast() // ปิดไว้ชั่วคราว

			case <-ticker.C:
				Hub.mu.Lock()
				clientCount := len(Hub.clients)
				Hub.mu.Unlock()
				if err := listener.Ping(); err != nil {
					log.Printf("[LISTEN] ping ไม่สำเร็จ: %v", err)
				} else {
					log.Printf("[LISTEN] alive ✓ | clients: %d", clientCount)
				}
				checkAndBroadcast()
				// checkNullAndBroadcast() // ปิดไว้ชั่วคราว
			}
		}
	}()
}
