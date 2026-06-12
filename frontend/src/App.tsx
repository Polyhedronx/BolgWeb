import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/lib/auth";
import Layout from "@/components/layout/Layout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// 首页直接加载（首屏关键路径），其余页面懒加载
import Home from "@/pages/Home";

const PostPage = lazy(() => import("@/pages/Post"));
const TagsPage = lazy(() => import("@/pages/Tags"));
const TagPostsPage = lazy(() => import("@/pages/TagPosts"));
const LoginPage = lazy(() => import("@/pages/Login"));
const RegisterPage = lazy(() => import("@/pages/Register"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      retry: 1,
    },
  },
});

function PageLoader() {
  return <LoadingSpinner />;
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  {/* 分类前缀路由 */}
                  <Route path="/tech/:slug" element={<PostPage />} />
                  <Route path="/essay/:slug" element={<PostPage />} />
                  <Route path="/daily/:year/:month/:dateSlug" element={<PostPage />} />
                  {/* 标签 */}
                  <Route path="/tags" element={<TagsPage />} />
                  <Route path="/tags/:tag" element={<TagPostsPage />} />
                  {/* 认证 */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
