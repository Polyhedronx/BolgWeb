package model

import "time"

// Comment represents a blog comment stored in PostgreSQL.
type Comment struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	PostSlug      string    `gorm:"column:post_slug;not null" json:"post_slug"`
	AuthorName    string    `gorm:"column:author_name;not null" json:"author_name"`
	AuthorEmail   string    `gorm:"column:author_email" json:"author_email,omitempty"`
	AuthorID      *uint     `gorm:"column:author_id" json:"author_id,omitempty"`
	Content       string    `gorm:"column:content;not null" json:"content"`
	ParentID      *uint     `gorm:"column:parent_id" json:"parent_id,omitempty"`
	IsApproved    bool      `gorm:"column:is_approved;default:true" json:"is_approved"`
	UpvoteCount   int       `gorm:"column:upvote_count;default:0" json:"upvote_count"`
	DownvoteCount int       `gorm:"column:downvote_count;default:0" json:"downvote_count"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at" json:"updated_at"`

	// Nested replies (not stored in DB)
	Children []Comment `gorm:"-" json:"children,omitempty"`
}

func (Comment) TableName() string {
	return "comments"
}

// CommentVote records a user's vote on a comment.
type CommentVote struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CommentID uint      `gorm:"column:comment_id;uniqueIndex:idx_comment_user;not null" json:"comment_id"`
	UserID    uint      `gorm:"column:user_id;uniqueIndex:idx_comment_user;not null" json:"user_id"`
	VoteType  string    `gorm:"column:vote_type;not null" json:"vote_type"` // "up" or "down"
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
}

func (CommentVote) TableName() string {
	return "comment_votes"
}

// CreateCommentRequest is the request body for creating a comment.
type CreateCommentRequest struct {
	PostSlug string `json:"post_slug" binding:"required"`
	Content  string `json:"content" binding:"required,max=5000"`
	ParentID *uint  `json:"parent_id"`
}
