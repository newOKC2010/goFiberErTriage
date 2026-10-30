package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"

	loadenv "tiage/loadenv"
)

var Db *sql.DB

func ConnectDB() *sql.DB {
	if Db != nil {
		return Db
	}

	loadenv.LoadDBconnec()

	env := os.Getenv("SELECT_START_DB")
	log.Printf("[DB] โหมด: %s", env)

	dbURL, err := validateAndGetDBURL()
	if err != nil {
		log.Fatalf("[DB] ตั้งค่า DB URL ไม่ถูกต้อง: %v", err)
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("[DB] เปิด connection ไม่สำเร็จ: %v", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("[DB] เชื่อมต่อฐานข้อมูลไม่สำเร็จ: %v", err)
	}

	Db = db
	log.Println("[DB] เชื่อมต่อฐานข้อมูลสำเร็จ ✓")
	return Db
}
