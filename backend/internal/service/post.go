package service

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	"blogweb/internal/model"

	"gopkg.in/yaml.v3"
)

// PostService manages loading, caching, and querying blog posts from Markdown files.
type PostService struct {
	mu          sync.RWMutex
	posts       []model.Post
	postsMap    map[string]*model.Post // slug -> post
	contentPath string
}

// NewPostService creates a PostService and loads all posts from the given content path.
func NewPostService(contentPath string) (*PostService, error) {
	s := &PostService{
		postsMap:    make(map[string]*model.Post),
		contentPath: contentPath,
	}
	if err := s.LoadPosts(contentPath); err != nil {
		return nil, err
	}
	return s, nil
}

// LoadPosts recursively scans the content directory for .md files and parses them.
func (s *PostService) LoadPosts(contentPath string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	postsDir := filepath.Join(contentPath, "posts")

	var posts []model.Post
	err := filepath.WalkDir(postsDir, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() || !strings.HasSuffix(d.Name(), ".md") {
			return nil
		}
		post, parseErr := parseMarkdownFile(path)
		if parseErr != nil {
			fmt.Printf("WARNING: skipping %s: %v\n", path, parseErr)
			return nil
		}
		posts = append(posts, *post)
		return nil
	})
	if err != nil {
		return fmt.Errorf("failed to scan posts directory %s: %w", postsDir, err)
	}

	// Sort by date descending (newest first)
	sort.Slice(posts, func(i, j int) bool {
		return posts[i].ParsedTime().After(posts[j].ParsedTime())
	})

	s.posts = posts
	s.postsMap = make(map[string]*model.Post, len(posts))
	for i := range posts {
		s.postsMap[posts[i].Slug] = &posts[i]
	}

	fmt.Printf("Loaded %d posts from %s\n", len(posts), postsDir)
	return nil
}

// parseMarkdownFile reads a .md file and extracts frontmatter + content.
func parseMarkdownFile(path string) (*model.Post, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read error: %w", err)
	}

	raw := string(data)

	// Expect the file to start with "---\n" (frontmatter delimiter)
	if !strings.HasPrefix(raw, "---") {
		return nil, fmt.Errorf("missing frontmatter delimiter")
	}

	// Find the closing delimiter
	parts := strings.SplitN(raw[3:], "---", 2)
	if len(parts) < 2 {
		return nil, fmt.Errorf("malformed frontmatter")
	}

	fm := model.Frontmatter{}
	if err := yaml.Unmarshal([]byte(parts[0]), &fm); err != nil {
		return nil, fmt.Errorf("frontmatter parse error: %w", err)
	}

	content := strings.TrimSpace(parts[1])

	if fm.Slug == "" {
		return nil, fmt.Errorf("slug is required in frontmatter")
	}

	visibility := fm.Visibility
	if visibility == "" {
		visibility = "public"
	}

	return &model.Post{
		Title:       fm.Title,
		Date:        fm.Date,
		Tags:        fm.Tags,
		Category:    fm.Category,
		Slug:        fm.Slug,
		Description: fm.Description,
		Content:     content,
		Visibility:  visibility,
	}, nil
}

// Reload re-scans the content directory. Call after modifying Markdown files.
func (s *PostService) Reload() error {
	return s.LoadPosts(s.contentPath)
}

// canView checks whether a user with the given role can see a post.
func canView(userRole, postVisibility string) bool {
	if postVisibility == "" || postVisibility == "public" {
		return true
	}
	return userRole == model.RoleAdmin || userRole == model.RolePremium
}

// List returns paginated post summaries, optionally filtered by tag or category.
// userRole can be empty (unauthenticated user).
func (s *PostService) List(tag, category, userRole string, page, limit int) model.PostListResponse {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var filtered []model.PostSummary
	for _, p := range s.posts {
		if !canView(userRole, p.Visibility) {
			continue
		}
		if tag != "" && !containsTag(p.Tags, tag) {
			continue
		}
		if category != "" && p.Category != category {
			continue
		}
		filtered = append(filtered, model.PostSummary{
			Title:       p.Title,
			Date:        p.Date,
			Tags:        p.Tags,
			Category:    p.Category,
			Slug:        p.Slug,
			Description: p.Description,
			Visibility:  p.Visibility,
		})
	}

	total := len(filtered)
	if total == 0 {
		return model.PostListResponse{
			Posts:      []model.PostSummary{},
			Total:      0,
			Page:       page,
			Limit:      limit,
			TotalPages: 0,
		}
	}

	start := (page - 1) * limit
	if start >= total {
		start = total
	}
	end := start + limit
	if end > total {
		end = total
	}

	totalPages := (total + limit - 1) / limit

	return model.PostListResponse{
		Posts:      filtered[start:end],
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}
}

// GetBySlug returns a full post by its slug. The userRole parameter controls
// visibility: empty string for unauthenticated, "admin"/"premium"/"user" for roles.
// Returns (post, accessible, found).
func (s *PostService) GetBySlug(slug, userRole string) (*model.Post, bool, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	p, ok := s.postsMap[slug]
	if !ok {
		return nil, false, false
	}
	return p, canView(userRole, p.Visibility), true
}

// GetBySlugPublic is the legacy version for backwards compatibility.
func (s *PostService) GetBySlugPublic(slug string) (*model.Post, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	p, ok := s.postsMap[slug]
	return p, ok
}

// GetAllPosts returns all posts (used for search, RSS, sitemap).
func (s *PostService) GetAllPosts() []model.Post {
	s.mu.RLock()
	defer s.mu.RUnlock()

	posts := make([]model.Post, len(s.posts))
	copy(posts, s.posts)
	return posts
}

// GetAllTags returns all tags with their post counts.
func (s *PostService) GetAllTags() []model.TagCount {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tagCount := make(map[string]int)
	for _, p := range s.posts {
		for _, t := range p.Tags {
			tagCount[t]++
		}
	}

	tags := make([]model.TagCount, 0, len(tagCount))
	for name, count := range tagCount {
		tags = append(tags, model.TagCount{Name: name, Count: count})
	}

	sort.Slice(tags, func(i, j int) bool {
		return tags[i].Count > tags[j].Count
	})

	return tags
}

// GetAllCategories returns all categories with their post counts.
func (s *PostService) GetAllCategories() []model.TagCount {
	s.mu.RLock()
	defer s.mu.RUnlock()

	catCount := make(map[string]int)
	for _, p := range s.posts {
		if p.Category != "" {
			catCount[p.Category]++
		}
	}

	cats := make([]model.TagCount, 0, len(catCount))
	for name, count := range catCount {
		cats = append(cats, model.TagCount{Name: name, Count: count})
	}

	sort.Slice(cats, func(i, j int) bool {
		return cats[i].Count > cats[j].Count
	})

	return cats
}

func containsTag(tags []string, target string) bool {
	for _, t := range tags {
		if strings.EqualFold(t, target) {
			return true
		}
	}
	return false
}
