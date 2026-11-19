package er

import (
	"sync"

	"tiage/controller/utils"
)

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
