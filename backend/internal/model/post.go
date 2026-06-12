package model

import "time"

// Frontmatter represents the YAML metadata at the top of a Markdown post.
type Frontmatter struct {
	Title       string   `yaml:"title"`
	Date        string   `yaml:"date"`
	Tags        []string `yaml:"tags"`
	Category    string   `yaml:"category"`
	Slug        string   `yaml:"slug"`
	Description string   `yaml:"description"`
	Visibility  string   `yaml:"visibility"`
}

// Post represents a full blog post (metadata + content).
type Post struct {
	Title       string   `json:"title"`
	Date        string   `json:"date"`
	Tags        []string `json:"tags"`
	Category    string   `json:"category"`
	Slug        string   `json:"slug"`
	Description string   `json:"description"`
	Content     string   `json:"content"`
	Visibility  string   `json:"visibility"`
}

// PostSummary is a lightweight version without the full content body.
type PostSummary struct {
	Title       string   `json:"title"`
	Date        string   `json:"date"`
	Tags        []string `json:"tags"`
	Category    string   `json:"category"`
	Slug        string   `json:"slug"`
	Description string   `json:"description"`
	Visibility  string   `json:"visibility"`
}

// PostListResponse is the paginated response for post listing.
type PostListResponse struct {
	Posts      []PostSummary `json:"posts"`
	Total      int           `json:"total"`
	Page       int           `json:"page"`
	Limit      int           `json:"limit"`
	TotalPages int           `json:"total_pages"`
}

// TagCount represents a tag with the number of articles that use it.
type TagCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

// ParsedTime returns the post's date as a time.Time for sorting.
func (p *Post) ParsedTime() time.Time {
	t, err := time.Parse("2006-01-02", p.Date)
	if err != nil {
		return time.Time{}
	}
	return t
}
