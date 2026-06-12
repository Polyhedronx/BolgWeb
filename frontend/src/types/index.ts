// Blog post summary (list view)
export interface PostSummary {
  title: string;
  date: string;
  tags: string[];
  category: string;
  slug: string;
  description: string;
}

// Full blog post (detail view)
export interface Post extends PostSummary {
  content: string;
}

// Paginated post list response
export interface PostListResponse {
  posts: PostSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Tag or category with count
export interface TagCount {
  name: string;
  count: number;
}

// Comment
export interface Comment {
  id: number;
  post_slug: string;
  author_name: string;
  author_email?: string;
  content: string;
  parent_id?: number | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  children?: Comment[];
}

// Comment form data
export interface CreateCommentRequest {
  post_slug: string;
  author_name: string;
  author_email?: string;
  content: string;
  parent_id?: number | null;
}

// Search results
export interface SearchResults {
  results: PostSummary[];
  query: string;
}
