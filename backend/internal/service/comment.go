package service

import (
	"strings"

	"blogweb/internal/model"
	"blogweb/internal/repository"
)

// CommentService handles business logic for comments.
type CommentService struct {
	repo *repository.CommentRepository
}

// NewCommentService creates a new CommentService.
func NewCommentService(repo *repository.CommentRepository) *CommentService {
	return &CommentService{repo: repo}
}

// GetByPostSlug returns approved comments for a post, organized into a tree.
func (s *CommentService) GetByPostSlug(postSlug, sortBy string, userID *uint) ([]model.Comment, error) {
	comments, err := s.repo.GetByPostSlug(postSlug, sortBy)
	if err != nil {
		return nil, err
	}

	// Attach user's votes if authenticated
	if userID != nil && len(comments) > 0 {
		ids := collectIDs(comments)
		if votes, err := s.repo.GetUserVotes(*userID, ids); err == nil {
			// We'll pass votes through context or just attach to the response
			_ = votes // used later in handler
		}
	}

	return buildCommentTree(comments), nil
}

func collectIDs(comments []model.Comment) []uint {
	ids := make([]uint, len(comments))
	for i, c := range comments {
		ids[i] = c.ID
	}
	return ids
}

// Create creates a new comment (authenticated users only).
func (s *CommentService) Create(authorID uint, authorName, authorEmail, postSlug, content string, parentID *uint) (*model.Comment, error) {
	// Sensitive word check
	if _, hit := filterSensitive(content); hit {
		return nil, &ServiceError{Message: "评论包含敏感词，请修改后提交"}
	}

	// Verify parent
	if parentID != nil {
		parent, err := s.repo.GetByID(*parentID)
		if err != nil || parent.PostSlug != postSlug {
			return nil, ErrInvalidParent
		}
	}

	comment := &model.Comment{
		PostSlug:    postSlug,
		AuthorName:  authorName,
		AuthorEmail: authorEmail,
		AuthorID:    &authorID,
		Content:     content,
		ParentID:    parentID,
		IsApproved:  true,
	}

	if err := s.repo.Create(comment); err != nil {
		return nil, err
	}
	return comment, nil
}

// GetByID returns a single comment.
func (s *CommentService) GetByID(id uint) (*model.Comment, error) {
	return s.repo.GetByID(id)
}

// Delete removes a comment by ID.
func (s *CommentService) Delete(id uint) error {
	return s.repo.Delete(id)
}

// Vote casts a vote and returns the updated comment with new counts.
func (s *CommentService) Vote(commentID, userID uint, voteType string) (*model.Comment, error) {
	if _, _, err := s.repo.Vote(commentID, userID, voteType); err != nil {
		return nil, err
	}
	return s.repo.GetByID(commentID)
}

// GetUserVotes returns a map of commentID -> voteType.
func (s *CommentService) GetUserVotes(userID uint, commentIDs []uint) (map[uint]string, error) {
	return s.repo.GetUserVotes(userID, commentIDs)
}

// GetPending returns all unapproved comments.
func (s *CommentService) GetPending() ([]model.Comment, error) {
	return s.repo.GetPending()
}

// Approve approves a comment by ID.
func (s *CommentService) Approve(id uint) error {
	return s.repo.Approve(id)
}

// Reject deletes a comment by ID.
func (s *CommentService) Reject(id uint) error {
	return s.repo.Reject(id)
}

// ── helpers ──

// sensitiveWords is a list of patterns to reject in comment content.
var sensitiveWords = []string{
	"赌博", "赌场", "彩票",
	"枪支", "弹药",
	"毒品", "大麻", "海洛因",
	"色情", "成人影片",
	"高利贷", "裸贷",
	"代办证件", "假证",
}

func filterSensitive(content string) (string, bool) {
	lower := strings.ToLower(content)
	for _, w := range sensitiveWords {
		if strings.Contains(lower, w) {
			return w, true
		}
	}
	return "", false
}

func buildCommentTree(comments []model.Comment) []model.Comment {
	byID := make(map[uint]*model.Comment, len(comments))
	for i := range comments {
		comments[i].Children = []model.Comment{}
		byID[comments[i].ID] = &comments[i]
	}

	// First pass: link all children to parents
	for i := range comments {
		c := &comments[i]
		if c.ParentID != nil {
			if parent, ok := byID[*c.ParentID]; ok {
				parent.Children = append(parent.Children, *c)
			}
		}
	}

	// Second pass: collect roots (Children are now fully populated)
	var roots []model.Comment
	for i := range comments {
		if comments[i].ParentID == nil {
			roots = append(roots, comments[i])
		}
	}

	return roots
}

// Predefined errors
var ErrInvalidParent = &ServiceError{Message: "parent comment not found or belongs to a different post"}

type ServiceError struct {
	Message string
}

func (e *ServiceError) Error() string {
	return e.Message
}
