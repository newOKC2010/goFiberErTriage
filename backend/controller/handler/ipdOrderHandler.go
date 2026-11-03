package handler

import (
	"bufio"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/valyala/fasthttp"

	"tiage/controller/service"
	"tiage/controller/utils"
)

// IPDOrderSSE ส่ง IPD doctor order ที่ยังไม่ approve แบบ real-time
func IPDOrderSSE(c *fiber.Ctx) error {
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

	c.Context().SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
		ch := make(chan []utils.IPDOrderAlert, 1)
		service.IPDHub.Register(ch)
		defer service.IPDHub.Unregister(ch)

		pingTicker := time.NewTicker(10 * time.Second)
		defer pingTicker.Stop()

		for {
			select {
			case orders := <-ch:
				data, _ := json.Marshal(orders)
				if _, err := fmt.Fprintf(w, "data: %s\n\n", data); err != nil {
					return
				}
				if err := w.Flush(); err != nil {
					return
				}
			case <-pingTicker.C:
				if _, err := fmt.Fprintf(w, ": ping\n\n"); err != nil {
					return
				}
				if err := w.Flush(); err != nil {
					return
				}
			}
		}
	}))
	return nil
}
