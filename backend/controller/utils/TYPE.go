package utils

import (
	"time"

	loadenv "tiage/loadenv"
)

// ERPatient ข้อมูลผู้ป่วย ER ที่รอแพทย์ตรวจ
type ERPatient struct {
	VstDate       string    `json:"vstdate"`
	HN            string    `json:"hn"`
	VN            string    `json:"vn"`
	FullName      string    `json:"full_name"`
	EmergencyType int       `json:"emergency_type"`
	EmergencyName string    `json:"emergency_name"`
	EnterERTime   time.Time `json:"enter_er_time"`
	ElapsedMin    int       `json:"elapsed_min"` // คำนวณจาก DB (NOW() - enter_er_time)
}

// ERAlert ข้อมูลแจ้งเตือน
type ERAlert struct {
	HN            string `json:"hn"`
	VN            string `json:"vn"`
	FullName      string `json:"full_name"`
	EmergencyType int    `json:"emergency_type"`
	EmergencyName string `json:"emergency_name"`
	EnterERDate   string `json:"enter_er_date"`
	EnterERTime   string `json:"enter_er_time"`
	ElapsedMin    int    `json:"elapsed_min"`
	ThresholdMin  int    `json:"threshold_min"`
	Message       string `json:"message"`
}

// NullTypeAlert ผู้ป่วยที่เข้า ER แต่ยังไม่ระบุ emergency type
type NullTypeAlert struct {
	HN          string `json:"hn"`
	VN          string `json:"vn"`
	FullName    string `json:"full_name"`
	EnterERDate string `json:"enter_er_date"`
	EnterERTime string `json:"enter_er_time"`
	ElapsedMin  int    `json:"elapsed_min"`
	Message     string `json:"message"`
}

// IPDOrderAlert แจ้งเตือน IPD doctor order ที่ยังไม่ได้ approve
type IPDOrderAlert struct {
	AN         string `json:"an"`
	OrderDate  string `json:"order_date"`
	OrderTime  string `json:"order_time"`
	DoctorName string `json:"doctor_name"`
	HN         string `json:"hn"`
	FullName   string `json:"full_name"`
}

// AlertThresholds โหลดจาก .env ตอน startup
// แก้ค่าได้ที่ .env แล้ว restart server
var AlertThresholds map[int]int

func init() {
	AlertThresholds = loadenv.LoadThresholds()
}
