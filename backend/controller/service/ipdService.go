package service

import (
	"tiage/controller/utils"
	conn "tiage/database"
)

// GetIPDOrderHistory ดึง IPD order detail ย้อนหลัง N วัน (กรอง is_start IS DISTINCT FROM 'Y' เหมือนกัน)
func GetIPDOrderHistory(days int) ([]utils.IPDOrderAlert, error) {
	db := conn.Db
	query := `
		SELECT
			dd.ipd_doctor_order_detail_id::TEXT,
			dd.ipd_doctor_order_id::TEXT,
			d.an::TEXT,
			d.order_date::TEXT,
			d.order_time::TEXT,
			COALESCE(dot.ipd_doctor_order_type_name, '') AS order_type,
			COALESCE(dd.order_text, '') AS order_text,
			COALESCE(doc.name, '') AS doctor_name,
			COALESCE(ipt.hn, '') AS hn,
			CONCAT(p.pname, p.fname, ' ', p.lname) AS full_name
		FROM ipd_doctor_order_detail dd
		JOIN ipd_doctor_order d ON d.ipd_doctor_order_id = dd.ipd_doctor_order_id
		LEFT JOIN ipd_doctor_order_type dot ON dot.ipd_doctor_order_type_id = dd.ipd_doctor_order_type_id
		LEFT JOIN doctor doc ON doc.code = d.doctor_code
		LEFT JOIN ipt ON ipt.an = d.an
		LEFT JOIN patient p ON p.hn = ipt.hn
		WHERE
			d.order_date >= CURRENT_DATE - ($1 * INTERVAL '1 day')
			AND dd.is_start IS DISTINCT FROM 'Y'
			AND doc.position_id = '1'
		ORDER BY d.ipd_doctor_order_id ASC, dd.ipd_doctor_order_detail_id ASC
	`
	rows, err := db.Query(query, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []utils.IPDOrderAlert
	for rows.Next() {
		var o utils.IPDOrderAlert
		if err := rows.Scan(
			&o.DetailID, &o.OrderID, &o.AN, &o.OrderDate, &o.OrderTime,
			&o.OrderType, &o.OrderText, &o.DoctorName, &o.HN, &o.FullName,
		); err != nil {
			return nil, err
		}
		list = append(list, o)
	}
	return list, nil
}

// GetPendingIPDOrders ดึง IPD order detail ที่ยังไม่ได้เริ่ม (is_start IS NULL หรือ '')
func GetPendingIPDOrders() ([]utils.IPDOrderAlert, error) {
	db := conn.Db
	query := `
		SELECT
			dd.ipd_doctor_order_detail_id::TEXT,
			dd.ipd_doctor_order_id::TEXT,
			d.an::TEXT,
			d.order_date::TEXT,
			d.order_time::TEXT,
			COALESCE(dot.ipd_doctor_order_type_name, '') AS order_type,
			COALESCE(dd.order_text, '') AS order_text,
			COALESCE(doc.name, '') AS doctor_name,
			COALESCE(ipt.hn, '') AS hn,
			CONCAT(p.pname, p.fname, ' ', p.lname) AS full_name
		FROM ipd_doctor_order_detail dd
		JOIN ipd_doctor_order d ON d.ipd_doctor_order_id = dd.ipd_doctor_order_id
		LEFT JOIN ipd_doctor_order_type dot ON dot.ipd_doctor_order_type_id = dd.ipd_doctor_order_type_id
		LEFT JOIN doctor doc ON doc.code = d.doctor_code
		LEFT JOIN ipt ON ipt.an = d.an
		LEFT JOIN patient p ON p.hn = ipt.hn
		WHERE
			d.order_date = CURRENT_DATE
			AND dd.is_start IS DISTINCT FROM 'Y'
			AND doc.position_id = '1'
		ORDER BY d.ipd_doctor_order_id ASC, dd.ipd_doctor_order_detail_id ASC
	`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []utils.IPDOrderAlert
	for rows.Next() {
		var o utils.IPDOrderAlert
		if err := rows.Scan(
			&o.DetailID, &o.OrderID, &o.AN, &o.OrderDate, &o.OrderTime,
			&o.OrderType, &o.OrderText, &o.DoctorName, &o.HN, &o.FullName,
		); err != nil {
			return nil, err
		}
		list = append(list, o)
	}
	return list, nil
}
