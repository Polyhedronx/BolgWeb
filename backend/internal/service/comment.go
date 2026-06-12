package service

import (
	"bolgweb/internal/model"
	"bolgweb/internal/repository"
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
func (s *CommentService) GetByPostSlug(postSlug string) ([]model.Comment, error) {
	comments, err := s.repo.GetByPostSlug(postSlug)
	if err != nil {
		return nil, err
	}

	// Build a tree: top-level comments with nested children
	return buildCommentTree(comments), nil
}

// Create creates a new comment after basic validation.
func (s *CommentService) Create(req model.CreateCommentRequest) (*model.Comment, error) {
	// If ParentID is provided, verify it exists and belongs to the same post
	if req.ParentID != nil {
		parent, err := s.repo.GetByID(*req.ParentID)
		if err != nil || parent.PostSlug != req.PostSlug {
			return nil, ErrInvalidParent
		}
	}

	comment := &model.Comment{
		PostSlug:    req.PostSlug,
		AuthorName:  req.AuthorName,
		AuthorEmail: req.AuthorEmail,
		Content:     req.Content,
		ParentID:    req.ParentID,
		IsApproved:  true, // auto-approve for now
	}

	if err := s.repo.Create(comment); err != nil {
		return nil, err
	}

	return comment, nil
}

// buildCommentTree organizes flat comments into a parent-children tree.
func buildCommentTree(comments []model.Comment) []model.Comment {
	byID := make(map[uint]*model.Comment, len(comments))
	for i := range comments {
		comments[i].Children = []model.Comment{}
		byID[comments[i].ID] = &comments[i]
	}

	var roots []model.Comment
	for i := range comments {
		c := &comments[i]
		if c.ParentID == nil {
			roots = append(roots, *c)
		} else {
			if parent, ok := byID[*c.ParentID]; ok {
				parent.Children = append(parent.Children, *c)
			}
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
