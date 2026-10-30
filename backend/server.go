package main

import (
	controller "tiage/controller"
	cors "tiage/controller/cors"
	conn "tiage/database"
	loadenv "tiage/loadenv"
	routes "tiage/routes"

	"log"

	"github.com/gofiber/fiber/v2"
)

func main() {
	port := loadenv.LoadPort()
	if port == "" {
		log.Fatal("PORT is not set")
	}

	conn.ConnectDB()
	conn.CreateERNotifyTrigger()
	controller.Init()

	app := fiber.New()
	cors.CorsConfig(app)
	routes.SetupRoutes(app)

	log.Printf("Server started on port: %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}
