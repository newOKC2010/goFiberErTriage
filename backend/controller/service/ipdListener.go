package service

import (
	"log"
	"os"
	"sync"
	"time"

	"github.com/lib/pq"

	"tiage/controller/utils"
)

// IPDHub — SSE hub สำหรับ IPD order alerts (snapshot)
var IPDHub = &ipdHub{clients: make(map[chan []utils.IPDOrderAlert]struct{})}

type ipdHub struct {
	mu      sync.Mutex
	clients map[chan []utils.IPDOrderAlert]struct{}
}

func (h *ipdHub) Register(ch chan []utils.IPDOrderAlert) {
	h.mu.Lock()
	h.clients[ch] = struct{}{}
	h.mu.Unlock()
}

func (h *ipdHub) Unregister(ch chan []utils.IPDOrderAlert) {
	h.mu.Lock()
	delete(h.clients, ch)
	h.mu.Unlock()
}

func (h *ipdHub) broadcast(list []utils.IPDOrderAlert) {
	if list == nil {
		list = []utils.IPDOrderAlert{}
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	for ch := range h.clients {
		select {
		case ch <- list:
		default:
		}
	}
}

func checkIPDAndBroadcast() {
	list, err := GetPendingIPDOrders()
	if err != nil {
		log.Printf("[IPD] query error: %v", err)
		return
	}
	log.Printf("[IPD] pending orders: %d", len(list))
	for _, o := range list {
		log.Printf("[IPD] AN:%s HN:%s %s | แพทย์: %s | %s %s",
			o.AN, o.HN, o.FullName, o.DoctorName, o.OrderDate, o.OrderTime)
	}
	IPDHub.broadcast(list)
}

// StartIPDListener เริ่ม listen channel 'ipd_order_update' จาก PostgreSQL
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
