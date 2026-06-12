package handler

import (
	"net/http"

	"bolgweb/internal/model"
	"bolgweb/internal/service"

	"github.com/gin-gonic/gin"
)

// CommentHandler handles comment-related HTTP requests.
type CommentHandler struct {
	commentService *service.CommentService
}

// NewCommentHandler creates a new CommentHandler.
func NewCommentHandler(commentService *service.CommentService) *CommentHandler {
	return &CommentHandler{commentService: commentService}
}

// GetComments handles GET /api/v1/comments?post_slug=xxx
func (h *CommentHandler) GetComments(c *gin.Context) {
	postSlug := c.Query("post_slug")
	if postSlug == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "post_slug query parameter is required"})
		return
	}

	comments, err := h.commentService.GetByPostSlug(postSlug)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch comments"})
		return
	}

	// Return empty array instead of null
	if comments == nil {
		comments = []model.Comment{}
	}

	c.JSON(http.StatusOK, gin.H{"comments": comments})
}

// CreateComment handles POST /api/v1/comments
func (h *CommentHandler) CreateComment(c *gin.Context) {
	var req model.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment, err := h.commentService.Create(req)
	if err != nil {
		if svcErr, ok := err.(*service.ServiceError); ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": svcErr.Message})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create comment"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"comment": comment})
}
