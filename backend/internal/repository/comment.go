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
func (r *CommentRepository) GetByPostSlug(postSlug, sortBy string) ([]model.Comment, error) {
	var comments []model.Comment
	order := "created_at ASC"
	if sortBy == "votes" {
		order = "(upvote_count - downvote_count) DESC, created_at ASC"
	}
	err := r.db.Where("post_slug = ? AND is_approved = ?", postSlug, true).
		Order(order).
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

// Delete removes a comment by ID.
func (r *CommentRepository) Delete(id uint) error {
	return r.db.Delete(&model.Comment{}, id).Error
}

// Vote casts or changes a vote on a comment. Also updates the comment's vote counts.
func (r *CommentRepository) Vote(commentID, userID uint, voteType string) (upDelta, downDelta int, err error) {
	var existing model.CommentVote
	result := r.db.Where("comment_id = ? AND user_id = ?", commentID, userID).First(&existing)

	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return 0, 0, result.Error
	}

	// No existing vote — create one
	if result.Error == gorm.ErrRecordNotFound {
		v := model.CommentVote{CommentID: commentID, UserID: userID, VoteType: voteType}
		if err := r.db.Create(&v).Error; err != nil {
			return 0, 0, err
		}
		if voteType == "up" {
			upDelta = 1
		} else {
			downDelta = 1
		}
	} else if existing.VoteType == voteType {
		// Same vote — remove (toggle off)
		r.db.Delete(&existing)
		if voteType == "up" {
			upDelta = -1
		} else {
			downDelta = -1
		}
	} else {
		// Changing vote type
		existing.VoteType = voteType
		r.db.Save(&existing)
		if voteType == "up" {
			upDelta = 1
			downDelta = -1
		} else {
			upDelta = -1
			downDelta = 1
		}
	}

	// Update the comment's vote counts in the database
	if upDelta != 0 {
		r.db.Model(&model.Comment{}).Where("id = ?", commentID).
			UpdateColumn("upvote_count", gorm.Expr("upvote_count + ?", upDelta))
	}
	if downDelta != 0 {
		r.db.Model(&model.Comment{}).Where("id = ?", commentID).
			UpdateColumn("downvote_count", gorm.Expr("downvote_count + ?", downDelta))
	}

	return upDelta, downDelta, nil
}

// GetUserVotes returns a map of commentID -> voteType for the given user.
func (r *CommentRepository) GetUserVotes(userID uint, commentIDs []uint) (map[uint]string, error) {
	var votes []model.CommentVote
	if err := r.db.Where("user_id = ? AND comment_id IN ?", userID, commentIDs).Find(&votes).Error; err != nil {
		return nil, err
	}
	result := make(map[uint]string, len(votes))
	for _, v := range votes {
		result[v.CommentID] = v.VoteType
	}
	return result, nil
}

// GetPending retrieves unapproved comments.
func (r *CommentRepository) GetPending() ([]model.Comment, error) {
	var comments []model.Comment
	err := r.db.Where("is_approved = ?", false).Order("created_at DESC").Find(&comments).Error
	return comments, err
}

// Approve sets a comment's is_approved to true.
func (r *CommentRepository) Approve(id uint) error {
	return r.db.Model(&model.Comment{}).Where("id = ?", id).Update("is_approved", true).Error
}

// Reject deletes a comment by ID.
func (r *CommentRepository) Reject(id uint) error {
	return r.db.Delete(&model.Comment{}, id).Error
}

// AutoMigrate runs GORM auto-migration for the Comment and CommentVote models.
func (r *CommentRepository) AutoMigrate() error {
	if err := r.db.AutoMigrate(&model.Comment{}); err != nil {
		return err
	}
	return r.db.AutoMigrate(&model.CommentVote{})
}
