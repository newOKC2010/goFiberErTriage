package handlerMophAlert

import (
	"fmt"

	mophAlertUtils "tiage/controller/alert/utils"
)

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
