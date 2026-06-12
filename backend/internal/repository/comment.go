package repository

import (
	"bolgweb/internal/model"

	"gorm.io/gorm"
)

// CommentRepository handles database operations for comments.
type CommentRepository struct {
	db *gorm.DB
}

// NewCommentRepository creates a new CommentRepository.
func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

// GetByPostSlug retrieves approved comments for a post, ordered by creation time.
func (r *CommentRepository) GetByPostSlug(postSlug string) ([]model.Comment, error) {
	var comments []model.Comment
	err := r.db.Where("post_slug = ? AND is_approved = ?", postSlug, true).
		Order("created_at ASC").
		Find(&comments).Error
	return comments, err
}

// GetByID retrieves a single comment by ID.
func (r *CommentRepository) GetByID(id uint) (*model.Comment, error) {
	var comment model.Comment
	err := r.db.First(&comment, id).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

// Create inserts a new comment into the database.
func (r *CommentRepository) Create(comment *model.Comment) error {
	return r.db.Create(comment).Error
}

// AutoMigrate runs GORM auto-migration for the Comment model.
func (r *CommentRepository) AutoMigrate() error {
	return r.db.AutoMigrate(&model.Comment{})
}
