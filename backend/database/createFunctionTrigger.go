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

	// ── er_alert_monitor table ────────────────────────────────────────────────
	tableSQL := `
		CREATE TABLE IF NOT EXISTS er_alert_monitor (
			id                SERIAL PRIMARY KEY,
			vn                VARCHAR(20) NOT NULL UNIQUE,
			emergency_type_id INTEGER NOT NULL,
			enter_er_time     TIMESTAMP NOT NULL,
			status            CHAR(1) DEFAULT 'T',
			created_at        TIMESTAMP DEFAULT NOW()
		)
	`
	if _, err := Db.Exec(tableSQL); err != nil {
		log.Fatalf("[MODEL] สร้างตาราง er_alert_monitor ไม่สำเร็จ: %v", err)
	}
	log.Println("[MODEL] table er_alert_monitor ✓")

	// trigger function: INSERT หรือ UPDATE er_emergency_type บน er_regist
	fnSQL := `
		CREATE OR REPLACE FUNCTION fn_er_alert_monitor()
		RETURNS TRIGGER AS $$
		BEGIN
			IF TG_OP = 'INSERT' THEN
				IF NEW.er_emergency_type IS NOT NULL THEN
					INSERT INTO er_alert_monitor (vn, emergency_type_id, enter_er_time)
					VALUES (NEW.vn, NEW.er_emergency_type, NEW.enter_er_time)
					ON CONFLICT (vn) DO UPDATE SET
						emergency_type_id = EXCLUDED.emergency_type_id,
						enter_er_time     = EXCLUDED.enter_er_time,
						status            = 'T';
					PERFORM pg_notify('er_alert_update', NEW.vn::text);
				END IF;
			ELSE  -- UPDATE
				IF OLD.er_emergency_type IS NULL AND NEW.er_emergency_type IS NOT NULL THEN
					INSERT INTO er_alert_monitor (vn, emergency_type_id, enter_er_time)
					VALUES (NEW.vn, NEW.er_emergency_type, NEW.enter_er_time)
					ON CONFLICT (vn) DO UPDATE SET
						emergency_type_id = EXCLUDED.emergency_type_id,
						enter_er_time     = EXCLUDED.enter_er_time,
						status            = 'T';
					PERFORM pg_notify('er_alert_update', NEW.vn::text);
				ELSIF OLD.er_emergency_type IS NOT NULL AND NEW.er_emergency_type IS NOT NULL
					  AND OLD.er_emergency_type <> NEW.er_emergency_type THEN
					UPDATE er_alert_monitor
					SET emergency_type_id = NEW.er_emergency_type
					WHERE vn = NEW.vn AND status = 'T';
					PERFORM pg_notify('er_alert_update', NEW.vn::text);
				ELSIF OLD.er_emergency_type IS NOT NULL AND NEW.er_emergency_type IS NULL THEN
					UPDATE er_alert_monitor SET status = 'F'
					WHERE vn = NEW.vn AND status = 'T';
					PERFORM pg_notify('er_alert_update', NEW.vn::text);
				END IF;
			END IF;
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
	`
	if _, err := Db.Exec(fnSQL); err != nil {
		log.Fatalf("[MODEL] สร้าง function fn_er_alert_monitor ไม่สำเร็จ: %v", err)
	}
	log.Println("[MODEL] function fn_er_alert_monitor ✓")

	// trigger AFTER INSERT
	triggerInsertSQL := `
		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM pg_trigger WHERE tgname = 'trg_er_alert_insert'
			) THEN
				CREATE TRIGGER trg_er_alert_insert
				AFTER INSERT ON er_regist
				FOR EACH ROW EXECUTE FUNCTION fn_er_alert_monitor();
				RAISE NOTICE 'trigger trg_er_alert_insert: created';
			ELSE
				RAISE NOTICE 'trigger trg_er_alert_insert: already exists, skipped';
			END IF;
		END;
		$$;
	`
	if _, err := Db.Exec(triggerInsertSQL); err != nil {
		log.Fatalf("[MODEL] สร้าง trigger trg_er_alert_insert ไม่สำเร็จ: %v", err)
	}
	log.Println("[MODEL] trigger trg_er_alert_insert ✓")

	// trigger AFTER UPDATE OF er_emergency_type (ทุกการเปลี่ยนแปลง type)
	triggerUpdateSQL := `
		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1 FROM pg_trigger WHERE tgname = 'trg_er_alert_type_set'
			) THEN
				CREATE TRIGGER trg_er_alert_type_set
				AFTER UPDATE OF er_emergency_type ON er_regist
				FOR EACH ROW
				WHEN (NEW.er_emergency_type IS DISTINCT FROM OLD.er_emergency_type)
				EXECUTE FUNCTION fn_er_alert_monitor();
				RAISE NOTICE 'trigger trg_er_alert_type_set: created';
			ELSE
				RAISE NOTICE 'trigger trg_er_alert_type_set: already exists, skipped';
			END IF;
		END;
		$$;
	`
	if _, err := Db.Exec(triggerUpdateSQL); err != nil {
		log.Fatalf("[MODEL] สร้าง trigger trg_er_alert_type_set ไม่สำเร็จ: %v", err)
	}
	log.Println("[MODEL] trigger trg_er_alert_type_set ✓")

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
