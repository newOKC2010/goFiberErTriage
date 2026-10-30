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

// NullTypeSSE ส่งผู้ป่วยที่ยังไม่ระบุ emergency type
func NullTypeSSE(c *fiber.Ctx) error {
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

	c.Context().SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
		ch := make(chan []utils.NullTypeAlert, 1)
		service.NullHub.Register(ch)
		defer service.NullHub.Unregister(ch)

		pingTicker := time.NewTicker(10 * time.Second)
		defer pingTicker.Stop()

		for {
			select {
			case alerts := <-ch:
				data, _ := json.Marshal(alerts)
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

// ERAlertSSE ส่ง alert แบบ real-time ผ่าน SSE
// รับ []ERAlert สำเร็จรูปจาก service goroutine กลาง
func ERAlertSSE(c *fiber.Ctx) error {
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

	c.Context().SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
		ch := make(chan []utils.ERAlert, 1)
		service.Hub.Register(ch)
		defer service.Hub.Unregister(ch)

		// keepalive ping ป้องกัน connection timeout
		pingTicker := time.NewTicker(10 * time.Second)
		defer pingTicker.Stop()

		for {
			select {
			case alerts := <-ch:
				// รับ alerts สำเร็จรูปจาก service → serialize → ส่ง frontend
				data, _ := json.Marshal(alerts)
				if _, err := fmt.Fprintf(w, "data: %s\n\n", data); err != nil {
					return
				}
				if err := w.Flush(); err != nil {
					return
				}
			case <-pingTicker.C:
				// keepalive ป้องกัน connection timeout
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
