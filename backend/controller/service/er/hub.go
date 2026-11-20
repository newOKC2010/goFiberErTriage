package er

import (
	"sync"

	"tiage/controller/utils"
)

type notifyHub struct {
	mu      sync.Mutex
	clients map[chan []utils.ERAlert]struct{}
	last    []utils.ERAlert // รายการล่าสุด ส่งให้ client ที่เพิ่ง connect
}

var Hub = &notifyHub{clients: make(map[chan []utils.ERAlert]struct{})}

// Register เพิ่ม client และส่ง card ที่ค้างอยู่ให้ทันที (แบบไม่กระพริบ)
func (h *notifyHub) Register(ch chan []utils.ERAlert) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[ch] = struct{}{}
	snap := make([]utils.ERAlert, len(h.last))
	for i, a := range h.last {
		a.Alert = false
		snap[i] = a
	}
	select {
	case ch <- snap:
	default:
	}
}
func (h *notifyHub) Unregister(ch chan []utils.ERAlert) {
	h.mu.Lock(); delete(h.clients, ch); h.mu.Unlock()
}
func (h *notifyHub) broadcast(alerts []utils.ERAlert) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.last = alerts
	for ch := range h.clients {
		select {
		case ch <- alerts:
		default:
		}
	}
}

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
