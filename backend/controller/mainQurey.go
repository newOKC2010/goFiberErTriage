package controller

import (
	service "tiage/controller/service"
)

// Init เริ่มต้น service และ handler ทั้งหมด
func Init() {
	service.InitERListener()
}
