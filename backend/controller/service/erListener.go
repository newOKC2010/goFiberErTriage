package service

import (
	"log"
	"os"
	"sync"
	"time"

	"github.com/lib/pq"

	mophAlert "tiage/controller/alert"
	"tiage/controller/utils"
)

// notifyHub broadcast []ERAlert ไปยัง SSE clients
type notifyHub struct {
	mu      sync.Mutex
	clients map[chan []utils.ERAlert]struct{}
}

var Hub = &notifyHub{clients: make(map[chan []utils.ERAlert]struct{})}

func (h *notifyHub) Register(ch chan []utils.ERAlert) {
	h.mu.Lock(); h.clients[ch] = struct{}{}; h.mu.Unlock()
}
func (h *notifyHub) Unregister(ch chan []utils.ERAlert) {
	h.mu.Lock(); delete(h.clients, ch); h.mu.Unlock()
}
func (h *notifyHub) broadcast(alerts []utils.ERAlert) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for ch := range h.clients {
		select {
		case ch <- alerts:
		default:
		}
	}
}

// NullTypeHub สำหรับผู้ป่วยที่ยังไม่ระบุ emergency type
type nullTypeHub struct {
	mu      sync.Mutex
	clients map[chan []utils.NullTypeAlert]struct{}
}

var NullHub = &nullTypeHub{clients: make(map[chan []utils.NullTypeAlert]struct{})}

func (h *nullTypeHub) Register(ch chan []utils.NullTypeAlert) {
	h.mu.Lock(); h.clients[ch] = struct{}{}; h.mu.Unlock()
}
func (h *nullTypeHub) Unregister(ch chan []utils.NullTypeAlert) {
	h.mu.Lock(); delete(h.clients, ch); h.mu.Unlock()
}
func (h *nullTypeHub) broadcast(alerts []utils.NullTypeAlert) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for ch := range h.clients {
		select {
		case ch <- alerts:
		default:
		}
	}
}

// checkNullAndBroadcast query ผู้ป่วย null type แล้ว broadcast
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

// startupCheckAndBroadcast ตรวจสอบทันทีตอน server start
func startupCheckAndBroadcast() {
	checkAndBroadcast()
}

// checkAndBroadcast query er_alert_monitor WHERE status='T' → เช็ค threshold → broadcast
func checkAndBroadcast() {
	list, err := GetPendingERAlerts()
	if err != nil {
		log.Printf("[ALERT] query error: %v", err)
		return
	}

	var alerts []utils.ERAlert
	for _, a := range list {
		threshold, ok := utils.AlertThresholds[a.EmergencyType]
		if !ok {
			continue
		}
		elapsed := a.ElapsedMin
		// broadcast เฉพาะจุดที่เป็นพหุคูณของ threshold (4, 8, 12...)
		if elapsed >= threshold && elapsed%threshold == 0 {
			a.ThresholdMin = threshold
			alerts = append(alerts, a)
			log.Printf("[ALERT] HN:%-8s  รอ %3d/%d นาที  [%s]  %s",
				a.HN, elapsed, threshold, a.EmergencyName, a.FullName)
			go mophAlert.SendERAlert(a.HN, a.FullName, a.EmergencyName,
				a.EnterERDate, a.EnterERTime, elapsed, threshold)
		}
	}
	Hub.broadcast(alerts)
}

// InitERListener เริ่ม listen channel 'er_alert_update' จาก PostgreSQL
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
		startupCheckAndBroadcast()
		checkNullAndBroadcast()

		for {
			select {
			case n, ok := <-listener.Notify:
				if !ok {
					log.Println("[LISTEN] channel ปิด หยุดการทำงาน")
					return
				}
				log.Printf("[LISTEN] รับ notify: vn=%s", n.Extra)
				checkAndBroadcast()
				checkNullAndBroadcast()

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
				checkNullAndBroadcast()
			}
		}
	}()
}
