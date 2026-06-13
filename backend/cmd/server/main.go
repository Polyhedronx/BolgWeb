package main

import (
	"fmt"
	"log"

	"blogweb/internal/auth"
	"blogweb/internal/config"
	"blogweb/internal/handler"
	"blogweb/internal/model"
	"blogweb/internal/repository"
	"blogweb/internal/router"
	"blogweb/internal/service"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to PostgreSQL
	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate database schemas
	commentRepo := repository.NewCommentRepository(db)
	if err := commentRepo.AutoMigrate(); err != nil {
		log.Fatalf("Failed to auto-migrate comments: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	if err := userRepo.AutoMigrate(); err != nil {
		log.Fatalf("Failed to auto-migrate users: %v", err)
	}
	fmt.Println("Database migration completed")

	// Seed admin user if none exists
	hasAdmin, err := userRepo.HasAdmin()
	if err != nil {
		log.Fatalf("Failed to check admin: %v", err)
	}
	if !hasAdmin {
		hash, err := auth.HashPassword(cfg.AdminPassword)
		if err != nil {
			log.Fatalf("Failed to hash admin password: %v", err)
		}
		admin := &model.User{
			Username:     cfg.AdminUsername,
			Email:        cfg.AdminEmail,
			PasswordHash: hash,
			Role:         model.RoleAdmin,
			Avatar:       cfg.AdminAvatar,
		}
		if err := userRepo.Create(admin); err != nil {
			log.Fatalf("Failed to create admin user: %v", err)
		}
		fmt.Println("Admin user created")
	}

	// Load blog posts from Markdown files
	postService, err := service.NewPostService(cfg.ContentPath)
	if err != nil {
		log.Fatalf("Failed to load posts: %v", err)
	}

	// Initialize services
	commentService := service.NewCommentService(commentRepo)

	// Initialize handlers
	postHandler := handler.NewPostHandler(postService)
	commentHandler := handler.NewCommentHandler(commentService)
	searchHandler := handler.NewSearchHandler(postService)
	rssHandler := handler.NewRSSHandler(
		postService,
		"http://localhost",
		"Blog 博客",
		"一个专注于技术与生活的个人博客",
	)
	authHandler := handler.NewAuthHandler(userRepo, cfg.JWTSecret)

	// Initialize about service
	aboutService := service.NewAboutService(cfg.ContentPath)
	aboutHandler := handler.NewAboutHandler(aboutService)

	// Setup routes
	r := router.Setup(postHandler, commentHandler, searchHandler, rssHandler, authHandler, aboutHandler, cfg.JWTSecret, cfg.ContentPath)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	fmt.Printf("Server starting on %s\n", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
