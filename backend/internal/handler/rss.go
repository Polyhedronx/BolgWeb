package handler

import (
	"encoding/xml"
	"net/http"
	"strings"
	"time"

	"blogweb/internal/service"

	"github.com/gin-gonic/gin"
)

// RSS related XML structures
type rssFeed struct {
	XMLName xml.Name  `xml:"rss"`
	Version string    `xml:"version,attr"`
	Channel rssChannel `xml:"channel"`
}

type rssChannel struct {
	Title       string     `xml:"title"`
	Link        string     `xml:"link"`
	Description string     `xml:"description"`
	Language    string     `xml:"language"`
	LastBuildDate string   `xml:"lastBuildDate"`
	Items       []rssItem  `xml:"item"`
}

type rssItem struct {
	Title       string `xml:"title"`
	Link        string `xml:"link"`
	Description string `xml:"description"`
	PubDate     string `xml:"pubDate"`
	Guid        string `xml:"guid"`
	Category    string `xml:"category,omitempty"`
}

// RSSHandler handles RSS feed generation.
type RSSHandler struct {
	postService *service.PostService
	siteURL     string
	siteTitle   string
	siteDesc    string
}

// NewRSSHandler creates a new RSSHandler.
func NewRSSHandler(postService *service.PostService, siteURL, siteTitle, siteDesc string) *RSSHandler {
	return &RSSHandler{
		postService: postService,
		siteURL:     siteURL,
		siteTitle:   siteTitle,
		siteDesc:    siteDesc,
	}
}

// GetRSS handles GET /api/v1/rss
func (h *RSSHandler) GetRSS(c *gin.Context) {
	posts := h.postService.GetAllPosts()

	items := make([]rssItem, 0, len(posts))
	for _, p := range posts {
		pubDate, _ := time.Parse("2006-01-02", p.Date)
		items = append(items, rssItem{
			Title:       p.Title,
			Link:        h.siteURL + "/posts/" + p.Slug,
			Description: p.Description,
			PubDate:     pubDate.Format(time.RFC1123Z),
			Guid:        h.siteURL + "/posts/" + p.Slug,
			Category:    p.Category,
		})
	}

	feed := rssFeed{
		Version: "2.0",
		Channel: rssChannel{
			Title:         h.siteTitle,
			Link:          h.siteURL,
			Description:   h.siteDesc,
			Language:      "zh-CN",
			LastBuildDate: time.Now().Format(time.RFC1123Z),
			Items:         items,
		},
	}

	c.Header("Content-Type", "application/rss+xml; charset=utf-8")
	c.String(http.StatusOK, xml.Header+renderRSS(feed))
}

func renderRSS(feed rssFeed) string {
	var buf strings.Builder
	enc := xml.NewEncoder(&buf)
	enc.Indent("", "  ")
	if err := enc.Encode(feed); err != nil {
		return ""
	}
	return buf.String()
}

// Sitemap URL entry
type sitemapURL struct {
	Loc        string `xml:"loc"`
	LastMod    string `xml:"lastmod,omitempty"`
	ChangeFreq string `xml:"changefreq,omitempty"`
	Priority   string `xml:"priority,omitempty"`
}

type sitemapURLSet struct {
	XMLName xml.Name     `xml:"urlset"`
	Xmlns   string       `xml:"xmlns,attr"`
	URLs    []sitemapURL `xml:"url"`
}

// GetSitemap handles GET /api/v1/sitemap.xml
func (h *RSSHandler) GetSitemap(c *gin.Context) {
	posts := h.postService.GetAllPosts()

	urls := []sitemapURL{
		{Loc: h.siteURL, ChangeFreq: "daily", Priority: "1.0"},
		{Loc: h.siteURL + "/about", ChangeFreq: "monthly", Priority: "0.6"},
	}

	today := time.Now().Format("2006-01-02")
	for _, p := range posts {
		urls = append(urls, sitemapURL{
			Loc:        h.siteURL + "/posts/" + p.Slug,
			LastMod:    p.Date,
			ChangeFreq: "monthly",
			Priority:   "0.8",
		})
	}

	sitemap := sitemapURLSet{
		Xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
		URLs:  urls,
	}

	_ = today

	c.Header("Content-Type", "application/xml; charset=utf-8")
	c.String(http.StatusOK, xml.Header+renderSitemap(sitemap))
}

func renderSitemap(s sitemapURLSet) string {
	var buf strings.Builder
	enc := xml.NewEncoder(&buf)
	enc.Indent("", "  ")
	if err := enc.Encode(s); err != nil {
		return ""
	}
	return buf.String()
}
