package service

import (
	"fmt"
	"time"

	"tiage/controller/utils"
	conn "tiage/database"
)

// GetPendingERPatients ดึงผู้ป่วยที่เข้า ER แล้วแต่ยังไม่ได้รับการตรวจ (doctor_tx_time IS NULL)
func GetPendingERPatients() ([]utils.ERPatient, error) {
	db := conn.Db
	query := `
		SELECT
			er.vstdate::TEXT,
			o.hn,
			er.vn,
			CONCAT(pt.pname, pt.fname, ' ', pt.lname) AS full_name,
			er.er_emergency_type,
			et.name AS emergency_name,
			er.enter_er_time,
			FLOOR(EXTRACT(EPOCH FROM (NOW() - er.enter_er_time)) / 60)::INT AS elapsed_min
		FROM
			ovst o
			JOIN er_regist er ON er.vn = o.vn
			JOIN er_emergency_type et ON et.er_emergency_type = er.er_emergency_type
			JOIN patient pt ON pt.hn = o.hn
		WHERE
			er.vstdate = CURRENT_DATE
			AND er.enter_er_time IS NOT NULL
			AND er.doctor_tx_time IS NULL
		ORDER BY
			er.enter_er_time
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var patients []utils.ERPatient
	for rows.Next() {
		var p utils.ERPatient
		if err := rows.Scan(
			&p.VstDate,
			&p.HN,
			&p.VN,
			&p.FullName,
			&p.EmergencyType,
			&p.EmergencyName,
			&p.EnterERTime,
			&p.ElapsedMin,
		); err != nil {
			return nil, err
		}
		patients = append(patients, p)
	}
	return patients, rows.Err()
}

// GetPendingERAlerts ดึง er_alert_monitor ที่ status='T' join er_regist เพื่อเอาข้อมูล patient
func GetPendingERAlerts() ([]utils.ERAlert, error) {
	db := conn.Db
	query := `
		SELECT
			o.hn,
			m.vn,
			CONCAT(pt.pname, pt.fname, ' ', pt.lname) AS full_name,
			m.emergency_type_id,
			COALESCE(et.name, '') AS emergency_name,
			m.enter_er_time,
			FLOOR(EXTRACT(EPOCH FROM (NOW() - m.enter_er_time)) / 60)::INT AS elapsed_min
		FROM
			er_alert_monitor m
			JOIN er_regist er ON er.vn = m.vn
			JOIN ovst o ON o.vn = m.vn
			JOIN patient pt ON pt.hn = o.hn
			LEFT JOIN er_emergency_type et ON et.er_emergency_type = m.emergency_type_id
		WHERE
			m.status = 'T'
		ORDER BY
			m.enter_er_time
	`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []utils.ERAlert
	for rows.Next() {
		var a utils.ERAlert
		var enterTime time.Time
		var emergencyType int
		var elapsedMin int
		if err := rows.Scan(
			&a.HN, &a.VN, &a.FullName,
			&emergencyType, &a.EmergencyName,
			&enterTime, &elapsedMin,
		); err != nil {
			return nil, err
		}
		a.EmergencyType = emergencyType
		a.ElapsedMin = elapsedMin
		a.EnterERDate = enterTime.Format("2006-01-02")
		a.EnterERTime = enterTime.Format("15:04:05")
		a.ThresholdMin = utils.AlertThresholds[emergencyType]
		a.Message = fmt.Sprintf("[%s] %s รอแพทย์ %d นาที", a.EmergencyName, a.FullName, elapsedMin)
		alerts = append(alerts, a)
	}
	return alerts, rows.Err()
}

// ClearERAlert อัปเดต status='F' ใน er_alert_monitor
func ClearERAlert(vn string) error {
	db := conn.Db
	_, err := db.Exec(`UPDATE er_alert_monitor SET status='F' WHERE vn=$1`, vn)
	return err
}

// GetNullTypePatients ดึงผู้ป่วยที่เข้า ER แล้วแต่ยังไม่ระบุ emergency type
// ไม่สน doctor_tx_time
func GetNullTypePatients() ([]utils.NullTypeAlert, error) {
	db := conn.Db
	query := `
		SELECT
			o.hn,
			er.vn,
			CONCAT(pt.pname, pt.fname, ' ', pt.lname) AS full_name,
			er.enter_er_time,
			FLOOR(EXTRACT(EPOCH FROM (NOW() - er.enter_er_time)) / 60)::INT AS elapsed_min
		FROM
			ovst o
			JOIN er_regist er ON er.vn = o.vn
			JOIN patient pt ON pt.hn = o.hn
		WHERE
			er.vstdate = CURRENT_DATE
			AND er.enter_er_time IS NOT NULL
			AND er.er_emergency_type IS NULL
		ORDER BY
			er.enter_er_time
	`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []utils.NullTypeAlert
	for rows.Next() {
		var a utils.NullTypeAlert
		var enterTime time.Time
		if err := rows.Scan(&a.HN, &a.VN, &a.FullName, &enterTime, &a.ElapsedMin); err != nil {
			return nil, err
		}
		a.EnterERDate = enterTime.Format("2006-01-02")
		a.EnterERTime = enterTime.Format("15:04:05")
		a.Message = "[ยังไม่ระบุ Type] " + a.FullName + " รอ " + fmt.Sprintf("%d", a.ElapsedMin) + " นาที"
		list = append(list, a)
	}
	return list, rows.Err()
}
