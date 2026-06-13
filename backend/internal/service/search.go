package service

import (
	"strings"
	"unicode/utf8"

	"blogweb/internal/model"
)

const snippetRadius = 80 // characters on each side of the match

// SearchPosts performs a case-insensitive full-text search across
// post titles, descriptions, tags, categories, and content.
// Results include a content snippet with matched keywords wrapped in 「」 markers.
func SearchPosts(posts []model.Post, query string) []model.SearchResultItem {
	query = strings.TrimSpace(query)
	if query == "" {
		return nil
	}

	var results []model.SearchResultItem
	for _, p := range posts {
		if !matchPost(p, query) {
			continue
		}
		results = append(results, model.SearchResultItem{
			Title:       p.Title,
			Date:        p.Date,
			Tags:        p.Tags,
			Category:    p.Category,
			Slug:        p.Slug,
			Description: p.Description,
			Snippet:     extractSnippet(p, query),
		})
	}
	return results
}

// extractSnippet finds the first occurrence of query (case-insensitive) in the post's
// content and returns a context window with the keyword wrapped in 「」 markers.
// Falls back to title/description if content doesn't match directly.
func extractSnippet(p model.Post, query string) string {
	contentLower := strings.ToLower(p.Content)
	q := strings.ToLower(query)

	// Try content first
	if idx := strings.Index(contentLower, q); idx >= 0 {
		start := idx - snippetRadius
		if start < 0 {
			start = 0
		}
		end := idx + len(q) + snippetRadius
		if end > len(p.Content) {
			end = len(p.Content)
		}

		snippet := p.Content[start:end]
		// Replace keyword with marked version (case-preserving original)
		keyword := p.Content[idx : idx+len(q)]
		snippet = strings.Replace(snippet, keyword, "「"+keyword+"」", 1)

		prefix := ""
		suffix := ""
		if start > 0 {
			prefix = "..."
		}
		if end < len(p.Content) {
			suffix = "..."
		}
		return prefix + cleanSnippet(snippet) + suffix
	}

	// Fallback: match in title (use title as snippet)
	if strings.Contains(strings.ToLower(p.Title), q) {
		return "标题匹配：" + markKeyword(p.Title, query)
	}

	// Fallback: match in description
	if strings.Contains(strings.ToLower(p.Description), q) {
		return markKeyword(p.Description, query)
	}

	// Fallback: match in tags
	for _, t := range p.Tags {
		if strings.Contains(strings.ToLower(t), q) {
			return "标签匹配：" + markKeyword(t, query)
		}
	}

	// Fallback: match in category
	return "分类：" + markKeyword(p.Category, query)
}

// markKeyword wraps the first occurrence of query (case-insensitive) in 「」 markers.
func markKeyword(text, query string) string {
	lower := strings.ToLower(text)
	q := strings.ToLower(query)
	idx := strings.Index(lower, q)
	if idx < 0 {
		return text
	}
	keyword := text[idx : idx+len(query)]
	return strings.Replace(text, keyword, "「"+keyword+"」", 1)
}

func cleanSnippet(s string) string {
	// Remove newlines and collapse whitespace for readability
	s = strings.ReplaceAll(s, "\n", " ")
	s = strings.ReplaceAll(s, "\r", " ")
	s = strings.ReplaceAll(s, "\t", " ")
	// Collapse multiple spaces
	var b strings.Builder
	inSpace := false
	for _, r := range s {
		if r == ' ' {
			if !inSpace {
				b.WriteRune(r)
				inSpace = true
			}
		} else {
			b.WriteRune(r)
			inSpace = false
		}
	}
	result := b.String()
	if utf8.RuneCountInString(result) > 200 {
		// Trim to ~200 runes for reasonable snippet length
		runes := []rune(result)
		result = string(runes[:200])
	}
	return result
}

func matchPost(p model.Post, query string) bool {
	q := strings.ToLower(query)
	if strings.Contains(strings.ToLower(p.Title), q) {
		return true
	}
	if strings.Contains(strings.ToLower(p.Description), q) {
		return true
	}
	if strings.Contains(strings.ToLower(p.Category), q) {
		return true
	}
	for _, t := range p.Tags {
		if strings.Contains(strings.ToLower(t), q) {
			return true
		}
	}
	if strings.Contains(strings.ToLower(p.Content), q) {
		return true
	}
	return false
}
