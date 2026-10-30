package database

import (
	"errors"
	"fmt"
	"os"
)

func validateAndGetDBURL() (string, error) {
	envValue := os.Getenv("SELECT_START_DB")
	if envValue == "" {
		return "", errors.New("SELECT_START_DB is not set")
	}

	var dbURL string
	switch envValue {
	case "DEV":
		dbURL = os.Getenv("DB_URL_DEV")
	case "PROD":
		dbURL = os.Getenv("DB_URL_PROD")
	default:
		return "", fmt.Errorf("invalid SELECT_START_DB: %s (must be DEV or PROD)", envValue)
	}

	if dbURL == "" {
		return "", fmt.Errorf("DB_URL_%s is not set", envValue)
	}

	return dbURL, nil
}
