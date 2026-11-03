package loadenv

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

func init() {
	// load .env ถ้ามี (dev) ถ้าไม่มีให้อ่านจาก environment (docker)
	_ = godotenv.Load()
}

func LoadDBconnec() string {
	return os.Getenv("DB_URL")
}

// LoadDBURL - คืน DB URL ตาม SELECT_START_DB (DEV/PROD)
func LoadDBURL() string {
	switch os.Getenv("SELECT_START_DB") {
	case "PROD":
		return os.Getenv("DB_URL_PROD")
	default:
		return os.Getenv("DB_URL_DEV")
	}
}

func LoadPort() string {
	return os.Getenv("PORT")
}

// LoadThresholds โหลดเวลา threshold (นาที) จาก .env ตาม er_emergency_type
func LoadThresholds() map[int]int {
	parse := func(key string) int {
		val := strings.TrimSuffix(os.Getenv(key), "m")
		n, err := strconv.Atoi(val)
		if err != nil || n <= 0 {
			log.Fatalf("[ENV] %s ไม่ถูกต้อง: '%s' (ต้องเป็นตัวเลขนาที เช่น 4m)", key, os.Getenv(key))
		}
		return n
	}
	return map[int]int{
		6: parse("1_RESUSCITATION"), // 1_Resuscitation
		1: parse("2_EMERGENCY"),     // 2_Emergency
		2: parse("3_URGENCY"),       // 3_Urgency
		7: parse("4_SEMI_URGENCY"),  // 4_Semi_Urgency
		5: parse("5_NON_URGENCY"),   // 5_Non_Urgency
	}
}

func LoadMOPHAlert() MOPHAlert {
	cids := strings.Split(os.Getenv("CID_ALERT"), ",")
	var filtered []string
	for _, c := range cids {
		c = strings.TrimSpace(c)
		if c != "" {
			filtered = append(filtered, c)
		}
	}
	return MOPHAlert{
		URL:       os.Getenv("MOPH_ALERT_URL"),
		ClientID:  os.Getenv("MOPH_ALERT_CLIENT_ID"),
		SecretKey: os.Getenv("MOPH_ALERT_SECRET_KEY"),
		CIDAlert:  filtered,
	}
}

func LoadCORS() CORS {
	_ = godotenv.Load()
	credentials, _ := strconv.ParseBool(os.Getenv("CORS_CREDENTIALS"))
	return CORS{
		Origins:     strings.Split(os.Getenv("CORS_ORIGINS"), ","),
		Credentials: credentials,
		Methods:     strings.Split(os.Getenv("CORS_METHODS"), ","),
		Headers:     strings.Split(os.Getenv("CORS_HEADERS"), ","),
	}
}
