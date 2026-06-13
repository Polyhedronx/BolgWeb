package handler

import (
	"net/http"
	"strconv"

	"blogweb/internal/model"
	"blogweb/internal/service"

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

// getOptionalUserID extracts user ID from context (may be 0 if not logged in).
func getOptionalUserID(c *gin.Context) *uint {
	if id, ok := c.Get("user_id"); ok {
		uid := id.(uint)
		return &uid
	}
	return nil
}

// GetComments handles GET /api/v1/comments?post_slug=xxx&sort=time|votes
func (h *CommentHandler) GetComments(c *gin.Context) {
	postSlug := c.Query("post_slug")
	if postSlug == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "post_slug query parameter is required"})
		return
	}

	sortBy := c.DefaultQuery("sort", "time")
	if sortBy != "time" && sortBy != "votes" {
		sortBy = "time"
	}

	userID := getOptionalUserID(c)
	comments, err := h.commentService.GetByPostSlug(postSlug, sortBy, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch comments"})
		return
	}

	if comments == nil {
		comments = []model.Comment{}
	}

	// Attach user votes
	voteMap := map[uint]string{}
	if userID != nil && len(comments) > 0 {
		ids := collectAllIDs(comments)
		voteMap, _ = h.commentService.GetUserVotes(*userID, ids)
	}

	c.JSON(http.StatusOK, gin.H{"comments": comments, "user_votes": voteMap})
}

func collectAllIDs(comments []model.Comment) []uint {
	var ids []uint
	var walk func([]model.Comment)
	walk = func(cs []model.Comment) {
		for _, c := range cs {
			ids = append(ids, c.ID)
			walk(c.Children)
		}
	}
	walk(comments)
	return ids
}

// CreateComment handles POST /api/v1/comments (authenticated only)
func (h *CommentHandler) CreateComment(c *gin.Context) {
	var req model.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetUint("user_id")
	username, _ := c.Get("username")
	userEmail, _ := c.Get("user_email")

	name := ""
	if n, ok := username.(string); ok {
		name = n
	}
	email := ""
	if e, ok := userEmail.(string); ok {
		email = e
	}

	comment, err := h.commentService.Create(
		userID,
		name,
		email,
		req.PostSlug,
		req.Content,
		req.ParentID,
	)
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

// DeleteOwnComment handles DELETE /api/v1/comments/:id (own comment)
func (h *CommentHandler) DeleteOwnComment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
		return
	}

	userID := c.GetUint("user_id")
	userRole, _ := c.Get("user_role")
	userEmail, _ := c.Get("user_email")

	comment, err := h.commentService.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "comment not found"})
		return
	}

	// 确定所有权：匹配 author_id，或旧评论（无 author_id）匹配 email
	role, _ := userRole.(string)
	isOwner := comment.AuthorID != nil && *comment.AuthorID == userID
	if !isOwner && comment.AuthorID == nil {
		email, _ := userEmail.(string)
		isOwner = email != "" && comment.AuthorEmail == email
	}
	if !isOwner && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "只能删除自己的评论"})
		return
	}

	if err := h.commentService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "comment deleted"})
}

// AdminDeleteComment handles DELETE /api/v1/admin/comments/:id (admin only)
func (h *CommentHandler) AdminDeleteComment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
		return
	}
	if err := h.commentService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "comment deleted"})
}

// VoteComment handles POST /api/v1/comments/:id/vote (authenticated)
func (h *CommentHandler) VoteComment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
		return
	}

	var body struct {
		VoteType string `json:"vote_type" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || (body.VoteType != "up" && body.VoteType != "down") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "vote_type must be 'up' or 'down'"})
		return
	}

	userID := c.GetUint("user_id")
	comment, err := h.commentService.Vote(uint(id), userID, body.VoteType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "投票失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"comment": comment})
}

// GetPendingComments handles GET /api/v1/admin/comments/pending (admin only)
func (h *CommentHandler) GetPendingComments(c *gin.Context) {
	comments, err := h.commentService.GetPending()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch comments"})
		return
	}
	if comments == nil {
		comments = []model.Comment{}
	}
	c.JSON(http.StatusOK, gin.H{"comments": comments})
}

// ApproveComment handles POST /api/v1/admin/comments/:id/approve (admin only)
func (h *CommentHandler) ApproveComment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
		return
	}
	if err := h.commentService.Approve(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to approve"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "comment approved"})
}

// RejectComment handles POST /api/v1/admin/comments/:id/reject (admin only)
func (h *CommentHandler) RejectComment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
		return
	}
	if err := h.commentService.Reject(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to reject"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "comment rejected"})
}
