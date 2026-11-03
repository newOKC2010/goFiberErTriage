package mophAlert

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	handlerMophAlert "tiage/controller/alert/handler"
	mophAlertUtils "tiage/controller/alert/utils"
	loadEnv "tiage/loadenv"
)

// returnError - helper สำหรับ return error response
func returnError(msg string, code int) mophAlertUtils.AlertResponse {
	return mophAlertUtils.AlertResponse{Message: msg, MessageCode: code}
}

// SendAlert - ส่งข้อความแจ้งเตือนผ่าน API
func SendAlert(payload mophAlertUtils.FlexAlertPayload) mophAlertUtils.AlertResponse {
	env := loadEnv.LoadMOPHAlert()
	apiURL := env.URL
	if apiURL == "" {
		apiURL = "https://api.example.com/alert"
	}

	// เตรียม JSON และสร้าง request
	jsonData, err := json.Marshal(payload)
	if err != nil {
		log.Printf("❌ JSON error: %v", err)
		return returnError("ส่งแจ้งเตือนไม่สำเร็จ", 500)
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("❌ Request error: %v", err)
		return returnError("ส่งแจ้งเตือนไม่สำเร็จ", 500)
	}

	// ตั้งค่า headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("client-key", env.ClientID)
	req.Header.Set("secret-key", env.SecretKey)

	// ส่ง request - ปิด SSL verification สำหรับ MOPH API
	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ HTTP error: %v", err)
		return returnError("ส่งแจ้งเตือนไม่สำเร็จ", 500)
	}
	defer resp.Body.Close()

	// อ่านและ decode response
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("❌ Read error: %v", err)
		return returnError("ส่งแจ้งเตือนไม่สำเร็จ", 500)
	}

	var result mophAlertUtils.AlertResponse
	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		log.Printf("❌ JSON decode error: %v", err)
		return returnError("ส่งแจ้งเตือนไม่สำเร็จ", 500)
	}

	// แสดงผลลัพธ์
	log.Printf("📤 ส่งแจ้งเตือนไปยัง CID: %s", strings.Join(payload.CID, ", "))
	log.Printf("📊 สถานะ: %d - %s", result.MessageCode, result.Message)

	return result
}

// SendERAlert ส่ง alert ER (เกินเวลา) ไปยัง CID ที่กำหนดใน .env
func SendERAlert(hn, fullName, emergencyName, enterDate, enterTime string, elapsedMin, thresholdMin int) mophAlertUtils.AlertResponse {
	env := loadEnv.LoadMOPHAlert()
	if len(env.CIDAlert) == 0 {
		log.Println("[MOPH] CID_ALERT ว่าง ข้ามการส่ง alert")
		return mophAlertUtils.AlertResponse{Message: "no cid", MessageCode: 0}
	}
	log.Printf("[MOPH] กำลังส่ง ER alert → CID: %s | HN:%s %s | %s | %d นาที",
		strings.Join(env.CIDAlert, ","), hn, fullName, emergencyName, elapsedMin)
	flexMsg := handlerMophAlert.CreateERAlertFlexMessage(hn, fullName, emergencyName, enterDate, enterTime, elapsedMin, thresholdMin)
	payload := mophAlertUtils.FlexAlertPayload{CID: env.CIDAlert, Messages: []mophAlertUtils.FlexMessage{flexMsg}}
	result := SendAlert(payload)
	if result.MessageCode == 200 {
		log.Printf("[MOPH] ✓ ส่ง ER alert สำเร็จ → CID: %s", strings.Join(env.CIDAlert, ","))
	} else {
		log.Printf("[MOPH] ✗ ส่ง ER alert ไม่สำเร็จ: %s (code: %d)", result.Message, result.MessageCode)
	}
	return result
}

// SendNullTypeAlert ส่ง alert ผู้ป่วยยังไม่ระบุ type ไปยัง CID ที่กำหนดใน .env
func SendNullTypeAlert(hn, fullName, enterDate, enterTime string, elapsedMin int) mophAlertUtils.AlertResponse {
	env := loadEnv.LoadMOPHAlert()
	if len(env.CIDAlert) == 0 {
		log.Println("[MOPH] CID_ALERT ว่าง ข้ามการส่ง null type alert")
		return mophAlertUtils.AlertResponse{Message: "no cid", MessageCode: 0}
	}
	log.Printf("[MOPH] กำลังส่ง Null Type alert → CID: %s | HN:%s %s | รอ %d นาที",
		strings.Join(env.CIDAlert, ","), hn, fullName, elapsedMin)
	flexMsg := handlerMophAlert.CreateNullTypeFlexMessage(hn, fullName, enterDate, enterTime, elapsedMin)
	payload := mophAlertUtils.FlexAlertPayload{CID: env.CIDAlert, Messages: []mophAlertUtils.FlexMessage{flexMsg}}
	result := SendAlert(payload)
	if result.MessageCode == 200 {
		log.Printf("[MOPH] ✓ ส่ง Null Type alert สำเร็จ → CID: %s", strings.Join(env.CIDAlert, ","))
	} else {
		log.Printf("[MOPH] ✗ ส่ง Null Type alert ไม่สำเร็จ: %s (code: %d)", result.Message, result.MessageCode)
	}
	return result
}

func SendMophOTP(cid, otpCode, fullName string) mophAlertUtils.AlertResponse {
	flexMsg := handlerMophAlert.CreateOTPFlexMessage(otpCode, fullName)
	payload := mophAlertUtils.FlexAlertPayload{
		CID:      []string{cid},
		Messages: []mophAlertUtils.FlexMessage{flexMsg},
	}
	return SendAlert(payload)
}
