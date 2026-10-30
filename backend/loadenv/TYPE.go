package loadenv

type CORS struct {
	Origins     []string
	Credentials bool
	Methods     []string
	Headers     []string
}
