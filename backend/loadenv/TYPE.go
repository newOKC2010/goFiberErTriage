package loadenv

type CORS struct {
	Origins     []string
	Credentials bool
	Methods     []string
	Headers     []string
}

type MOPHAlert struct {
	URL       string
	ClientID  string
	SecretKey string
	CIDAlert  []string // CID ที่จะส่ง alert ER
}
