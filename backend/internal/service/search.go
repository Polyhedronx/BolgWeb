package service

import (
	"strings"

	"bolgweb/internal/model"
)

// SearchPosts performs a case-insensitive full-text search across
// post titles, descriptions, tags, categories, and content.
func SearchPosts(posts []model.Post, query string) []model.PostSummary {
	query = strings.ToLower(strings.TrimSpace(query))
	if query == "" {
		return nil
	}

	var results []model.PostSummary
	for _, p := range posts {
		if matchPost(p, query) {
			results = append(results, model.PostSummary{
				Title:       p.Title,
				Date:        p.Date,
				Tags:        p.Tags,
				Category:    p.Category,
				Slug:        p.Slug,
				Description: p.Description,
			})
		}
	}

	return results
}

func matchPost(p model.Post, query string) bool {
	if strings.Contains(strings.ToLower(p.Title), query) {
		return true
	}
	if strings.Contains(strings.ToLower(p.Description), query) {
		return true
	}
	if strings.Contains(strings.ToLower(p.Category), query) {
		return true
	}
	for _, t := range p.Tags {
		if strings.Contains(strings.ToLower(t), query) {
			return true
		}
	}
	if strings.Contains(strings.ToLower(p.Content), query) {
		return true
	}
	return false
}
