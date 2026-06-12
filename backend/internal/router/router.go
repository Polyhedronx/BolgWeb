package router

import (
	"bolgweb/internal/handler"
	"bolgweb/internal/middleware"

	"github.com/gin-gonic/gin"
)

// Setup configures all routes and returns the Gin engine.
func Setup(
	postHandler *handler.PostHandler,
	commentHandler *handler.CommentHandler,
	searchHandler *handler.SearchHandler,
	rssHandler *handler.RSSHandler,
	authHandler *handler.AuthHandler,
	jwtSecret string,
) *gin.Engine {
	r := gin.Default()

	// Middleware
	r.Use(middleware.CORS())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1 — 所有路由附带可选认证（有 token 则解析，无则跳过）
	v1 := r.Group("/api/v1")
	v1.Use(middleware.AuthOptional(jwtSecret))
	{
		// Auth
		v1.POST("/auth/register", authHandler.Register)
		v1.POST("/auth/login", authHandler.Login)
		v1.GET("/auth/me", middleware.AuthRequired(jwtSecret), authHandler.Me)

		// Posts
		v1.GET("/posts", postHandler.ListPosts)
		v1.GET("/posts/:slug", postHandler.GetPost)

		// Tags & Categories
		v1.GET("/tags", postHandler.GetTags)
		v1.GET("/categories", postHandler.GetCategories)

		// Search
		v1.GET("/search", searchHandler.Search)

		// Comments
		v1.GET("/comments", commentHandler.GetComments)
		v1.POST("/comments", commentHandler.CreateComment)

		// RSS & Sitemap
		v1.GET("/rss", rssHandler.GetRSS)
		v1.GET("/sitemap.xml", rssHandler.GetSitemap)

		// Reload posts from disk
		v1.POST("/reload", postHandler.ReloadPosts)
		v1.POST("/webhook/github", postHandler.GitHubWebhook)
	}

	return r
}
