package database

import (
	"log"
	"os"
)

// CreateERNotifyTrigger สร้าง function + trigger ใน PostgreSQL
// จะทำงานเมื่อ CREATE_MODEL=true ใน .env เท่านั้น
// ถ้ามีอยู่แล้วจะข้ามโดยไม่ error
func CreateERNotifyTrigger() {
	if os.Getenv("CREATE_MODEL") != "true" {
		log.Println("[MODEL] CREATE_MODEL=false ข้ามการสร้าง trigger")
		return
	}

	log.Println("[MODEL] CREATE_MODEL=true กำลังตรวจสอบ trigger...")

	// สร้าง function (CREATE OR REPLACE ปลอดภัย ไม่ error ถ้ามีอยู่แล้ว)
	fnSQL := `
		CREATE OR REPLACE FUNCTION notify_er_change()
		RETURNS TRIGGER AS $$
		BEGIN
			PERFORM pg_notify('er_update', NEW.vn::text);
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
	`

	// สร้าง trigger เฉพาะถ้ายังไม่มี
	triggerSQL := `
		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM pg_trigger WHERE tgname = 'trg_er_regist_notify'
			) THEN
				CREATE TRIGGER trg_er_regist_notify
				AFTER INSERT OR UPDATE OF enter_er_time, doctor_tx_time, er_emergency_type ON er_regist
				FOR EACH ROW EXECUTE FUNCTION notify_er_change();
				RAISE NOTICE 'trigger trg_er_regist_notify: created';
			ELSE
				RAISE NOTICE 'trigger trg_er_regist_notify: already exists, skipped';
			END IF;
		END;
		$$;
	`

	if _, err := Db.Exec(fnSQL); err != nil {
		log.Fatalf("[MODEL] สร้าง function notify_er_change ไม่สำเร็จ: %v", err)
	}
	log.Println("[MODEL] function notify_er_change ✓")

	if _, err := Db.Exec(triggerSQL); err != nil {
		log.Fatalf("[MODEL] สร้าง trigger trg_er_regist_notify ไม่สำเร็จ: %v", err)
	}
	log.Println("[MODEL] trigger trg_er_regist_notify ✓")

	// IPD order trigger
	ipdFnSQL := `
		CREATE OR REPLACE FUNCTION notify_ipd_order_change()
		RETURNS TRIGGER AS $$
		BEGIN
			PERFORM pg_notify('ipd_order_update', NEW.ipd_doctor_order_detail_id::text);
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
	`
	ipdTriggerSQL := `
		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ipd_order_notify'
			) THEN
				CREATE TRIGGER trg_ipd_order_notify
				AFTER INSERT OR UPDATE OF is_start ON ipd_doctor_order_detail
				FOR EACH ROW EXECUTE FUNCTION notify_ipd_order_change();
				RAISE NOTICE 'trigger trg_ipd_order_notify: created';
			ELSE
				RAISE NOTICE 'trigger trg_ipd_order_notify: already exists, skipped';
			END IF;
		END;
		$$;
	`
	if _, err := Db.Exec(ipdFnSQL); err != nil {
		log.Fatalf("[MODEL] สร้าง function notify_ipd_order_change ไม่สำเร็จ: %v", err)
	}
	log.Println("[MODEL] function notify_ipd_order_change ✓")

	if _, err := Db.Exec(ipdTriggerSQL); err != nil {
		log.Fatalf("[MODEL] สร้าง trigger trg_ipd_order_notify ไม่สำเร็จ: %v", err)
	}
	log.Println("[MODEL] trigger trg_ipd_order_notify ✓")
}
