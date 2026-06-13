package handler

import (
	"net/http"

	"blogweb/internal/model"
	"blogweb/internal/service"

	"github.com/gin-gonic/gin"
)

// SearchHandler handles search-related HTTP requests.
type SearchHandler struct {
	postService *service.PostService
}

// NewSearchHandler creates a new SearchHandler.
func NewSearchHandler(postService *service.PostService) *SearchHandler {
	return &SearchHandler{postService: postService}
}

// Search handles GET /api/v1/search?q=xxx
func (h *SearchHandler) Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter 'q' is required"})
		return
	}

	posts := h.postService.GetAllPosts()
	results := service.SearchPosts(posts, query)

	if results == nil {
		results = []model.SearchResultItem{}
	}

	c.JSON(http.StatusOK, gin.H{"results": results, "query": query})
}
