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
