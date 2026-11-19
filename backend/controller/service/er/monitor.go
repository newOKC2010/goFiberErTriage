package er

import (
	"fmt"
	"log"

	conn "tiage/database"
)

func ClearERAlert(vn string) error {
	db := conn.Db
	_, err := db.Exec(`UPDATE er_alert_monitor SET status='F' WHERE vn=$1`, vn)
	return err
}

func AutoClearDischargedAlerts(vns []string) (map[string]bool, error) {
	if len(vns) == 0 {
		return nil, nil
	}
	db := conn.Db

	placeholders := ""
	args := make([]interface{}, len(vns))
	for i, v := range vns {
		if i > 0 {
			placeholders += ","
		}
		placeholders += fmt.Sprintf("$%d", i+1)
		args[i] = v
	}

	rows, err := db.Query(fmt.Sprintf(`
		SELECT vn FROM vn_stat
		WHERE vn IN (%s)
		  AND pdx IS NOT NULL AND pdx <> ''
	`, placeholders), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	cleared := make(map[string]bool)
	for rows.Next() {
		var vn string
		if err := rows.Scan(&vn); err != nil {
			return nil, err
		}
		cleared[vn] = true
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(cleared) > 0 {
		clearArgs := make([]interface{}, 0, len(cleared))
		ph := ""
		i := 1
		for v := range cleared {
			if i > 1 {
				ph += ","
			}
			ph += fmt.Sprintf("$%d", i)
			clearArgs = append(clearArgs, v)
			i++
		}
		q := fmt.Sprintf(`UPDATE er_alert_monitor SET status='F', pdx_detected_at=NOW() WHERE vn IN (%s)`, ph)
		if _, err := db.Exec(q, clearArgs...); err != nil {
			return cleared, err
		}
	}
	return cleared, nil
}

func UpdateLastAlertAt(vn string) {
	db := conn.Db
	q := `UPDATE er_alert_monitor SET
		last_alert_at  = NOW(),
		alert_count    = COALESCE(alert_count, 0) + 1,
		first_alert_at = COALESCE(first_alert_at, NOW())
	WHERE vn=$1`
	if _, err := db.Exec(q, vn); err != nil {
		log.Printf("[ALERT] UpdateLastAlertAt vn=%s error: %v", vn, err)
	}
}
