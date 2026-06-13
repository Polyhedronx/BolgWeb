package service

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"blogweb/internal/model"

	"gopkg.in/yaml.v3"
)

// aboutFrontmatter mirrors the YAML structure in content/about.md.
type aboutFrontmatter struct {
	Name   string            `yaml:"name"`
	Avatar string            `yaml:"avatar"`
	Bio    string            `yaml:"bio"`
	Social []socialLinkEntry `yaml:"social"`
	Skills []string          `yaml:"skills"`
}

type socialLinkEntry struct {
	Name string `yaml:"name"`
	URL  string `yaml:"url"`
}

// AboutService reads and serves the about page content.
type AboutService struct {
	contentPath string
}

// NewAboutService creates an AboutService.
func NewAboutService(contentPath string) *AboutService {
	return &AboutService{contentPath: contentPath}
}

// GetAbout reads content/about.md and parses it into an About model.
// Returns a default About (never nil) even if the file is missing or malformed.
func (s *AboutService) GetAbout() *model.About {
	filePath := filepath.Join(s.contentPath, "about.md")

	data, err := os.ReadFile(filePath)
	if err != nil {
		log.Printf("WARNING: about.md not found at %s, returning defaults", filePath)
		return &model.About{
			Content: "_尚未编写关于页面。_",
		}
	}

	fm, content, err := parseAboutFile(string(data))
	if err != nil {
		log.Printf("WARNING: failed to parse about.md: %v", err)
		return &model.About{
			Content: string(data),
		}
	}

	// Convert social link entries to model type
	socialLinks := make([]model.AboutSocialLink, 0, len(fm.Social))
	for _, entry := range fm.Social {
		if entry.Name != "" && entry.URL != "" {
			socialLinks = append(socialLinks, model.AboutSocialLink{
				Name: entry.Name,
				URL:  entry.URL,
			})
		}
	}

	return &model.About{
		Name:        fm.Name,
		Avatar:      fm.Avatar,
		Bio:         fm.Bio,
		SocialLinks: socialLinks,
		Skills:      fm.Skills,
		Content:     content,
	}
}

// parseAboutFile extracts YAML frontmatter and Markdown body from raw content.
func parseAboutFile(raw string) (*aboutFrontmatter, string, error) {
	if !strings.HasPrefix(raw, "---") {
		return nil, "", fmt.Errorf("missing frontmatter delimiter")
	}

	parts := strings.SplitN(raw[3:], "---", 2)
	if len(parts) < 2 {
		return nil, "", fmt.Errorf("malformed frontmatter")
	}

	fm := &aboutFrontmatter{}
	if err := yaml.Unmarshal([]byte(parts[0]), fm); err != nil {
		return nil, "", fmt.Errorf("frontmatter parse error: %w", err)
	}

	content := strings.TrimSpace(parts[1])
	return fm, content, nil
}
