import { test, expect } from '../../src/fixtures/test';
import { type Post } from '../../src/api/PostsApi';

/**
 * API tests against https://jsonplaceholder.typicode.com (a fake REST API:
 * writes are simulated and not persisted, so each test is self-contained).
 */
test.describe('Posts API', () => {
  test('GET /posts returns 100 posts', { tag: '@smoke' }, async ({ postsApi }) => {
    const response = await postsApi.list();

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const posts: Post[] = await response.json();
    expect(posts).toHaveLength(100);
  });

  test('GET /posts/:id returns the expected post', async ({ postsApi }) => {
    const response = await postsApi.get(1);

    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toEqual(
      expect.objectContaining({ id: 1, userId: 1, title: expect.any(String), body: expect.any(String) }),
    );
  });

  test('GET /posts?userId= filters by user', async ({ postsApi }) => {
    const response = await postsApi.list({ userId: 3 });
    const posts: Post[] = await response.json();

    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.userId).toBe(3);
    }
  });

  test('GET unknown post returns 404', async ({ postsApi }) => {
    const response = await postsApi.get(99999);

    expect(response.status()).toBe(404);
  });

  test('POST /posts creates a post', async ({ postsApi }) => {
    const newPost = { userId: 1, title: 'Playwright', body: 'API testing with Playwright' };

    const response = await postsApi.create(newPost);

    expect(response.status()).toBe(201);
    const created: Post = await response.json();
    expect(created).toMatchObject(newPost);
    expect(created.id).toEqual(expect.any(Number));
  });

  test('PUT /posts/:id updates a post', async ({ postsApi }) => {
    const updated = { id: 1, userId: 1, title: 'Updated title', body: 'Updated body' };

    const response = await postsApi.update(1, updated);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(updated);
  });

  test('DELETE /posts/:id deletes a post', async ({ postsApi }) => {
    const response = await postsApi.delete(1);

    expect(response.status()).toBe(200);
  });
});
