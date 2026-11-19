package controller

import (
	erSvc "tiage/controller/service/er"
	ipdSvc "tiage/controller/service/ipd"
)

// Init เริ่มต้น service และ handler ทั้งหมด
func Init() {
	erSvc.InitERListener()
	go ipdSvc.StartIPDListener()
}
