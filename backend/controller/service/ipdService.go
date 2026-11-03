package service

import (
	"tiage/controller/utils"
	conn "tiage/database"
)

// GetPendingIPDOrders ดึง IPD doctor order ที่ยังไม่ได้ approve วันนี้
func GetPendingIPDOrders() ([]utils.IPDOrderAlert, error) {
	db := conn.Db
	query := `
		SELECT
			id.an::TEXT,
			id.order_date::TEXT,
			id.order_time::TEXT,
			COALESCE(d.name, '') AS doctor_name,
			COALESCE(ipt.hn, '') AS hn,
			CONCAT(p.pname, p.fname, ' ', p.lname) AS full_name
		FROM ipd_doctor_order id
		LEFT JOIN doctor d ON d.code = id.doctor_code
		LEFT JOIN ipt ON ipt.an = id.an
		LEFT JOIN patient p ON p.hn = ipt.hn
		WHERE
			(id.order_approved IS NULL OR id.order_approved = '')
			AND id.order_date = CURRENT_DATE
			AND d.position_id = '1'
		ORDER BY id.order_date, id.order_time DESC
	`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []utils.IPDOrderAlert
	for rows.Next() {
		var o utils.IPDOrderAlert
		if err := rows.Scan(&o.AN, &o.OrderDate, &o.OrderTime, &o.DoctorName, &o.HN, &o.FullName); err != nil {
			return nil, err
		}
		list = append(list, o)
	}
	return list, nil
}
