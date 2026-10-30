package cors

import (
	"strings"

	loadenv "tiage/loadenv"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func CorsConfig(app fiber.Router) {
	corsConfig := loadenv.LoadCORS()
	app.Use(cors.New(cors.Config{
		AllowOrigins:     strings.Join(corsConfig.Origins, ","),
		AllowCredentials: corsConfig.Credentials,
		AllowMethods:     strings.Join(corsConfig.Methods, ","),
		AllowHeaders:     strings.Join(corsConfig.Headers, ","),
	}))
}
