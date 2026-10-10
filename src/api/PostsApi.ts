import { type APIRequestContext } from '@playwright/test';

export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

/**
 * Thin client over the /posts resource of JSONPlaceholder.
 * Methods return the raw APIResponse so tests can assert on status codes,
 * headers and body alike.
 */
export class PostsApi {
  constructor(private readonly request: APIRequestContext) {}

  list(params?: { userId: number }) {
    return this.request.get('/posts', { params });
  }

  get(id: number) {
    return this.request.get(`/posts/${id}`);
  }

  create(post: Omit<Post, 'id'>) {
    return this.request.post('/posts', { data: post });
  }

  update(id: number, post: Post) {
    return this.request.put(`/posts/${id}`, { data: post });
  }

  delete(id: number) {
    return this.request.delete(`/posts/${id}`);
  }
}
