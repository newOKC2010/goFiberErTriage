package handlerMophAlert

import (
	"fmt"
	"time"

	mophAlertUtils "tiage/controller/alert/utils"
)

// CreateOTPFlexMessage - สร้าง Flex Message สำหรับส่ง OTP
func CreateOTPFlexMessage(otpCode, fullName string) mophAlertUtils.FlexMessage {
	loc, _ := time.LoadLocation("Asia/Bangkok")
	currentTime := time.Now().In(loc).Format("02/01/2006 15:04:05")
	return mophAlertUtils.FlexMessage{
		Type:    "flex",
		AltText: "รหัส OTP สำหรับเข้าใช้งานระบบลงข้อมูลทรัพยากร",
		Contents: mophAlertUtils.FlexBubble{
			Type: "bubble",
			Header: &mophAlertUtils.FlexBox{
				Type:   "box",
				Layout: "vertical",
				Contents: []interface{}{
					mophAlertUtils.FlexText{
						Type:   "text",
						Text:   "🌿 ระบบลงข้อมูลทรัพยากร",
						Weight: "bold",
						Size:   "md",
						Color:  "#6ee778ff",
					},
				},
			},
			Body: &mophAlertUtils.FlexBox{
				Type:    "box",
				Layout:  "vertical",
				Spacing: "md",
				Contents: []interface{}{
					mophAlertUtils.FlexText{
						Type:  "text",
						Text:  fmt.Sprintf("สวัสดี คุณ%s", fullName),
						Size:  "sm",
						Color: "#555555",
						Wrap:  true,
					},
					mophAlertUtils.FlexText{
						Type:   "text",
						Text:   "รหัส OTP ของคุณคือ:",
						Size:   "xs",
						Color:  "#888888",
						Margin: "md",
					},
					mophAlertUtils.FlexBox{
						Type:   "box",
						Layout: "vertical",
						Margin: "lg",
						Contents: []interface{}{
							mophAlertUtils.FlexText{
								Type:   "text",
								Text:   otpCode,
								Weight: "bold",
								Size:   "xxl",
								Color:  "#59f172ff",
							},
						},
					},
					mophAlertUtils.FlexText{
						Type:   "text",
						Text:   fmt.Sprintf("⏱️ รหัสนี้มีอายุ 2 นาที\n🕐 ส่งเมื่อ: %s", currentTime),
						Size:   "xs",
						Color:  "#FF5551",
						Margin: "md",
						Wrap:   true,
					},
				},
			},
			Footer: &mophAlertUtils.FlexBox{
				Type:   "box",
				Layout: "vertical",
				Contents: []interface{}{
					mophAlertUtils.FlexText{
						Type:  "text",
						Text:  "⚠️ กรุณาอย่าแชร์รหัสนี้กับผู้อื่น",
						Size:  "xxs",
						Color: "#888888",
						Wrap:  true,
					},
				},
			},
		},
	}
}
