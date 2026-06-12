import type {
  Post,
  PostListResponse,
  TagCount,
  Comment,
  CreateCommentRequest,
  SearchResults,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = getAuthHeaders();
  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Posts
export async function getPosts(params?: {
  page?: number;
  limit?: number;
  tag?: string;
  category?: string;
}): Promise<PostListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.tag) searchParams.set("tag", params.tag);
  if (params?.category) searchParams.set("category", params.category);
  const qs = searchParams.toString();
  return fetchJSON<PostListResponse>(`${API_BASE}/posts${qs ? "?" + qs : ""}`);
}

export async function getPost(slug: string): Promise<Post> {
  return fetchJSON<Post>(`${API_BASE}/posts/${encodeURIComponent(slug)}`);
}

// Tags & Categories
export async function getTags(): Promise<{ tags: TagCount[] }> {
  return fetchJSON<{ tags: TagCount[] }>(`${API_BASE}/tags`);
}

export async function getCategories(): Promise<{ categories: TagCount[] }> {
  return fetchJSON<{ categories: TagCount[] }>(`${API_BASE}/categories`);
}

// Search
export async function searchPosts(query: string): Promise<SearchResults> {
  return fetchJSON<SearchResults>(
    `${API_BASE}/search?q=${encodeURIComponent(query)}`
  );
}

// Comments
export async function getComments(
  postSlug: string,
  sort?: string
): Promise<{ comments: Comment[]; user_votes: Record<number, string> }> {
  const qs = new URLSearchParams({ post_slug: postSlug });
  if (sort) qs.set("sort", sort);
  return fetchJSON(`${API_BASE}/comments?${qs}`);
}

export async function createComment(
  data: CreateCommentRequest
): Promise<{ comment: Comment }> {
  return fetchJSON<{ comment: Comment }>(`${API_BASE}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function voteComment(
  id: number,
  voteType: "up" | "down"
): Promise<{ comment: Comment }> {
  return fetchJSON(`${API_BASE}/comments/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vote_type: voteType }),
  });
}

export async function deleteComment(id: number): Promise<void> {
  return fetchJSON(`${API_BASE}/comments/${id}`, {
    method: "DELETE",
  });
}
