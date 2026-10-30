package routes

import (
	handler "tiage/controller/handler"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	er := app.Group("/api/er")
	er.Get("/alerts", handler.ERAlertSSE)
	er.Get("/null-type", handler.NullTypeSSE)
}
