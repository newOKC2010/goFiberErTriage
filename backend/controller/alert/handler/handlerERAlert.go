package handlerMophAlert

import (
	"fmt"
	"time"

	mophAlertUtils "tiage/controller/alert/utils"
)

// CreateNullTypeFlexMessage สร้าง Flex Message แจ้งเตือน ผู้ป่วยยังไม่ระบุ type
func CreateNullTypeFlexMessage(hn, fullName, enterDate, enterTime string, elapsedMin int) mophAlertUtils.FlexMessage {
	loc, _ := time.LoadLocation("Asia/Bangkok")
	now := time.Now().In(loc).Format("02/01/2006 15:04")
	return mophAlertUtils.FlexMessage{
		Type:    "flex",
		AltText: fmt.Sprintf("⚠️ ผู้ป่วยยังไม่ระบุ Type: %s เข้า ER %s %s", fullName, enterDate, enterTime),
		Contents: mophAlertUtils.FlexBubble{
			Type: "bubble",
			Header: &mophAlertUtils.FlexBox{
				Type:   "box",
				Layout: "vertical",
				Contents: []interface{}{
					mophAlertUtils.FlexText{
						Type:   "text",
						Text:   "⚠️ ยังไม่ระบุ Emergency Type",
						Weight: "bold",
						Size:   "md",
						Color:  "#FF8800",
					},
				},
			},
			Body: &mophAlertUtils.FlexBox{
				Type:    "box",
				Layout:  "vertical",
				Spacing: "sm",
				Contents: []interface{}{
					mophAlertUtils.FlexText{Type: "text", Text: fmt.Sprintf("👤 %s", fullName), Weight: "bold", Size: "md", Wrap: true},
					mophAlertUtils.FlexText{Type: "text", Text: fmt.Sprintf("HN: %s", hn), Size: "sm", Color: "#555555"},
					mophAlertUtils.FlexText{Type: "text", Text: fmt.Sprintf("🕐 เข้า ER: %s %s", enterDate, enterTime), Size: "sm", Color: "#555555", Margin: "md"},
					mophAlertUtils.FlexText{Type: "text", Text: fmt.Sprintf("⏳ รอ: %d นาที", elapsedMin), Size: "sm", Color: "#FF8800", Weight: "bold", Margin: "md"},
					mophAlertUtils.FlexText{Type: "text", Text: fmt.Sprintf("🕓 แจ้งเตือนเมื่อ: %s", now), Size: "xs", Color: "#888888", Margin: "md"},
				},
			},
		},
	}
}

// CreateERAlertFlexMessage สร้าง Flex Message แจ้งเตือน ER triage
func CreateERAlertFlexMessage(hn, fullName, emergencyName, enterDate, enterTime string, elapsedMin, thresholdMin int) mophAlertUtils.FlexMessage {
	headerColor := "#FF4444"
	altText := fmt.Sprintf("⚠️ แจ้งเตือน ER: %s รอแพทย์ %d นาที", fullName, elapsedMin)

	return mophAlertUtils.FlexMessage{
		Type:    "flex",
		AltText: altText,
		Contents: mophAlertUtils.FlexBubble{
			Type: "bubble",
			Header: &mophAlertUtils.FlexBox{
				Type:   "box",
				Layout: "vertical",
				Contents: []interface{}{
					mophAlertUtils.FlexText{
						Type:   "text",
						Text:   "🚨 แจ้งเตือน ER Triage",
						Weight: "bold",
						Size:   "md",
						Color:  headerColor,
					},
				},
			},
			Body: &mophAlertUtils.FlexBox{
				Type:    "box",
				Layout:  "vertical",
				Spacing: "sm",
				Contents: []interface{}{
					mophAlertUtils.FlexText{
						Type:   "text",
						Text:   fmt.Sprintf("👤 %s", fullName),
						Weight: "bold",
						Size:   "md",
						Wrap:   true,
					},
					mophAlertUtils.FlexText{
						Type:  "text",
						Text:  fmt.Sprintf("HN: %s", hn),
						Size:  "sm",
						Color: "#555555",
					},
					mophAlertUtils.FlexText{
						Type:   "text",
						Text:   fmt.Sprintf("🏷️ ประเภท: %s", emergencyName),
						Size:   "sm",
						Color:  "#333333",
						Margin: "md",
					},
					mophAlertUtils.FlexText{
						Type:  "text",
						Text:  fmt.Sprintf("🕐 เข้า ER: %s %s", enterDate, enterTime),
						Size:  "sm",
						Color: "#555555",
					},
					mophAlertUtils.FlexText{
						Type:   "text",
						Text:   fmt.Sprintf("⏳ รอแพทย์: %d นาที (threshold %d นาที)", elapsedMin, thresholdMin),
						Size:   "sm",
						Color:  "#FF4444",
						Weight: "bold",
						Margin: "md",
						Wrap:   true,
					},
				},
			},
		},
	}
}
