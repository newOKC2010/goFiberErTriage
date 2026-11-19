package ipd

import (
	"log"
	"os"
	"time"

	"github.com/lib/pq"
)

func checkIPDAndBroadcast() {
	list, err := GetPendingIPDOrders()
	if err != nil {
		log.Printf("[IPD] query error: %v", err)
		return
	}

	type group struct {
		an, hn, name, doctor, date, time string
		types                            []string
	}
	orderMap := make(map[string]*group)
	orderKeys := []string{}
	for _, o := range list {
		if _, ok := orderMap[o.OrderID]; !ok {
			orderMap[o.OrderID] = &group{
				an: o.AN, hn: o.HN, name: o.FullName,
				doctor: o.DoctorName, date: o.OrderDate, time: o.OrderTime,
			}
			orderKeys = append(orderKeys, o.OrderID)
		}
		orderMap[o.OrderID].types = append(orderMap[o.OrderID].types, o.OrderType)
	}

	log.Printf("[IPD] ══════ pending %d detail / %d order ══════", len(list), len(orderKeys))
	for _, k := range orderKeys {
		g := orderMap[k]
		log.Printf("[IPD] ┌ OrderID:%s  AN:%s  HN:%s", k, g.an, g.hn)
		log.Printf("[IPD] │ %s", g.name)
		log.Printf("[IPD] │ แพทย์: %s  |  %s %s", g.doctor, g.date, g.time)
		log.Printf("[IPD] └ รายการ (%d): %v", len(g.types), g.types)
	}
	log.Printf("[IPD] ═══════════════════════════════════════════")

	IPDHub.broadcast(list)
}

func StartIPDListener() {
	var connStr string
	if os.Getenv("SELECT_START_DB") == "DEV" {
		connStr = os.Getenv("DB_URL_DEV")
	} else {
		connStr = os.Getenv("DB_URL_PROD")
	}

	listener := pq.NewListener(connStr, 5*time.Second, time.Minute,
		func(ev pq.ListenerEventType, err error) {
			if ev == pq.ListenerEventDisconnected {
				log.Printf("[IPD] listener หลุดการเชื่อมต่อ: %v", err)
			}
		},
	)

	if err := listener.Listen("ipd_order_update"); err != nil {
		log.Printf("[IPD] listen error: %v", err)
		return
	}
	log.Println("[IPD] กำลัง listen channel 'ipd_order_update' ✓")

	go func() {
		ticker := time.NewTicker(time.Minute)
		defer ticker.Stop()

		checkIPDAndBroadcast()

		for {
			select {
			case n, ok := <-listener.Notify:
				if !ok {
					return
				}
				log.Printf("[IPD] รับ notify: an=%s", n.Extra)
				checkIPDAndBroadcast()
			case <-ticker.C:
				checkIPDAndBroadcast()
			}
		}
	}()
}
