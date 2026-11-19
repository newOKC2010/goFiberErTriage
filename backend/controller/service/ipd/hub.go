package ipd

import (
	"sync"

	"tiage/controller/utils"
)

type ipdHub struct {
	mu      sync.Mutex
	clients map[chan []utils.IPDOrderAlert]struct{}
}

var IPDHub = &ipdHub{clients: make(map[chan []utils.IPDOrderAlert]struct{})}

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
