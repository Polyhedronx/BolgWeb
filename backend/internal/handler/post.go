package handler

import (
	"net/http"
	"strconv"

	"blogweb/internal/service"

	"github.com/gin-gonic/gin"
)

// PostHandler handles post-related HTTP requests.
type PostHandler struct {
	postService *service.PostService
}

// NewPostHandler creates a new PostHandler.
func NewPostHandler(postService *service.PostService) *PostHandler {
	return &PostHandler{postService: postService}
}

// getUserRole extracts the user role from Gin context (set by AuthOptional/AuthRequired middleware).
func getUserRole(c *gin.Context) string {
	if r, ok := c.Get("user_role"); ok {
		if role, ok2 := r.(string); ok2 {
			return role
		}
	}
	return ""
}

// ListPosts handles GET /api/v1/posts
func (h *PostHandler) ListPosts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	tag := c.Query("tag")
	category := c.Query("category")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	userRole := getUserRole(c)
	result := h.postService.List(tag, category, userRole, page, limit)
	c.JSON(http.StatusOK, result)
}

// GetPost handles GET /api/v1/posts/:slug
func (h *PostHandler) GetPost(c *gin.Context) {
	slug := c.Param("slug")
	userRole := getUserRole(c)
	post, accessible, found := h.postService.GetBySlug(slug, userRole)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}
	if !accessible {
		c.JSON(http.StatusForbidden, gin.H{"error": "该文章仅对高级用户开放"})
		return
	}
	c.JSON(http.StatusOK, post)
}

// GetTags handles GET /api/v1/tags
func (h *PostHandler) GetTags(c *gin.Context) {
	tags := h.postService.GetAllTags()
	c.JSON(http.StatusOK, gin.H{"tags": tags})
}

// GetCategories handles GET /api/v1/categories
func (h *PostHandler) GetCategories(c *gin.Context) {
	cats := h.postService.GetAllCategories()
	c.JSON(http.StatusOK, gin.H{"categories": cats})
}

// ReloadPosts handles POST /api/v1/reload (hot-reloads posts from disk).
func (h *PostHandler) ReloadPosts(c *gin.Context) {
	if err := h.postService.Reload(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "posts reloaded"})
}

// GitHubWebhook handles POST /api/v1/webhook/github.
// Receives GitHub push events and triggers a post reload.
func (h *PostHandler) GitHubWebhook(c *gin.Context) {
	if err := h.postService.Reload(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "posts reloaded via webhook"})
}
