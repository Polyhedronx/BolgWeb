package config

import "os"

type Config struct {
	ServerPort   string
	DBHost       string
	DBPort       string
	DBUser       string
	DBPassword   string
	DBName       string
	ContentPath  string
	AdminEmail    string
	AdminPassword string
	AdminUsername string
	AdminAvatar   string
	JWTSecret     string
}

func Load() *Config {
	return &Config{
		ServerPort:    getEnv("SERVER_PORT", "8080"),
		DBHost:        getEnv("DB_HOST", "localhost"),
		DBPort:        getEnv("DB_PORT", "5432"),
		DBUser:        getEnv("DB_USER", "blog"),
		DBPassword:    getEnv("DB_PASSWORD", "blog123"),
		DBName:        getEnv("DB_NAME", "blog"),
		ContentPath:   getEnv("CONTENT_PATH", "./content"),
		AdminEmail:    getEnv("ADMIN_EMAIL", "admin@blog.com"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "admin123"),
		AdminUsername: getEnv("ADMIN_USERNAME", "Admin"),
		AdminAvatar:   getEnv("ADMIN_AVATAR", ""),
		JWTSecret:     getEnv("JWT_SECRET", "change-me-in-production"),
	}
}

func (c *Config) DSN() string {
	return "host=" + c.DBHost +
		" user=" + c.DBUser +
		" password=" + c.DBPassword +
		" dbname=" + c.DBName +
		" port=" + c.DBPort +
		" sslmode=disable TimeZone=Asia/Shanghai"
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}
