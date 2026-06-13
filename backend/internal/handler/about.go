package handler

import (
	"net/http"

	"blogweb/internal/service"

	"github.com/gin-gonic/gin"
)

// AboutHandler handles the about page endpoint.
type AboutHandler struct {
	aboutService *service.AboutService
}

// NewAboutHandler creates a new AboutHandler.
func NewAboutHandler(aboutService *service.AboutService) *AboutHandler {
	return &AboutHandler{aboutService: aboutService}
}

// GetAbout returns the about page content.
func (h *AboutHandler) GetAbout(c *gin.Context) {
	about := h.aboutService.GetAbout()
	c.JSON(http.StatusOK, about)
}
