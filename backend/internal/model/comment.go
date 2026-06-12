package model

import "time"

// Comment represents a blog comment stored in PostgreSQL.
type Comment struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	PostSlug    string     `gorm:"column:post_slug;not null" json:"post_slug"`
	AuthorName  string     `gorm:"column:author_name;not null" json:"author_name"`
	AuthorEmail string     `gorm:"column:author_email" json:"author_email,omitempty"`
	Content     string     `gorm:"column:content;not null" json:"content"`
	ParentID    *uint      `gorm:"column:parent_id" json:"parent_id,omitempty"`
	IsApproved  bool       `gorm:"column:is_approved;default:true" json:"is_approved"`
	CreatedAt   time.Time  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"column:updated_at" json:"updated_at"`

	// Nested replies (not stored in DB, populated at the service level)
	Children []Comment `gorm:"-" json:"children,omitempty"`
}

func (Comment) TableName() string {
	return "comments"
}

// CreateCommentRequest is the request body for creating a comment.
type CreateCommentRequest struct {
	PostSlug    string `json:"post_slug" binding:"required"`
	AuthorName  string `json:"author_name" binding:"required,max=100"`
	AuthorEmail string `json:"author_email"`
	Content     string `json:"content" binding:"required,max=5000"`
	ParentID    *uint  `json:"parent_id"`
}
