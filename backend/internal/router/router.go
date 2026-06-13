package router

import (
	"path/filepath"

	"blogweb/internal/handler"
	"blogweb/internal/middleware"

	"github.com/gin-gonic/gin"
)

// Setup configures all routes and returns the Gin engine.
func Setup(
	postHandler *handler.PostHandler,
	commentHandler *handler.CommentHandler,
	searchHandler *handler.SearchHandler,
	rssHandler *handler.RSSHandler,
	authHandler *handler.AuthHandler,
	aboutHandler *handler.AboutHandler,
	jwtSecret string,
	contentPath string,
) *gin.Engine {
	r := gin.Default()

	// Middleware
	r.Use(middleware.CORS())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Static files (e.g. avatar images) served from content/static/
	r.Static("/static", filepath.Join(contentPath, "static"))

	// API v1 — 所有路由附带可选认证
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

		// Comments (read is public; write needs auth)
		v1.GET("/comments", commentHandler.GetComments)

		commentAuth := v1.Group("")
		commentAuth.Use(middleware.AuthRequired(jwtSecret))
		{
			commentAuth.POST("/comments", commentHandler.CreateComment)
			commentAuth.POST("/comments/:id/vote", commentHandler.VoteComment)
			commentAuth.DELETE("/comments/:id", commentHandler.DeleteOwnComment)
		}

		// Admin
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthRequired(jwtSecret), middleware.RequireRole("admin"))
		{
			admin.DELETE("/comments/:id", commentHandler.AdminDeleteComment)
			admin.GET("/comments/pending", commentHandler.GetPendingComments)
			admin.POST("/comments/:id/approve", commentHandler.ApproveComment)
			admin.POST("/comments/:id/reject", commentHandler.RejectComment)
		}

		// RSS & Sitemap
		v1.GET("/rss", rssHandler.GetRSS)
		v1.GET("/sitemap.xml", rssHandler.GetSitemap)

		// About
		v1.GET("/about", aboutHandler.GetAbout)

		// Reload posts from disk
		v1.POST("/reload", postHandler.ReloadPosts)
		v1.POST("/webhook/github", postHandler.GitHubWebhook)
	}

	return r
}
