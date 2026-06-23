import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { deletePost, fetchPosts, fetchStats, fetchHealth } from '../lib/api.js';
import { StatCards } from '../ui/StatCards.jsx';
import { PostFilters } from '../ui/PostFilters.jsx';
import { PostList } from '../ui/PostList.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function normalizeParams(searchParams) {
  return {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    sort: searchParams.get('sort') || 'updated',
    limit: searchParams.get('limit') || '6',
    page: searchParams.get('page') || '1',
  };
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const filters = useMemo(() => normalizeParams(searchParams), [searchParams]);

  const postsQuery = useQuery({
    queryKey: ['posts', filters],
    queryFn: () => fetchPosts(filters),
  });

  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });

  const deleteMutation = useMutation({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  function handleApply(nextFilters) {
    const nextSearchParams = new URLSearchParams();

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) {
        nextSearchParams.set(key, value);
      }
    });
    nextSearchParams.set('page', '1');

    setSearchParams(nextSearchParams);
  }

  function changePage(nextPage) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('page', String(nextPage));
    setSearchParams(nextSearchParams);
  }

  function handleDelete(post) {
    const confirmed = window.confirm(`Delete "${post.title}"?`);
    if (confirmed) {
      deleteMutation.mutate(post.publicId);
    }
  }

  const categories = statsQuery.data?.categoryDistribution?.map((item) => item.category) ?? [];
  const popularTags = statsQuery.data?.popularTags ?? [];
  const topAuthors = statsQuery.data?.topAuthors ?? [];
  const pagination = postsQuery.data?.pagination;

  return (
    <div className="page-stack">
      <section className="hero card">
        <div>
          <p className="eyebrow">Operational Overview</p>
          <h1>Content dashboard</h1>
          <p>
            Review platform health, content distribution and latest editorial posts from one streamlined workspace.
          </p>
        </div>
        <div className="hero-actions">
          {isAuthenticated ? (
            <button className="button primary" onClick={() => navigate('/posts/new')} type="button">
              Create New Post
            </button>
          ) : (
            <Link className="button primary" to="/login">
              Sign In To Manage
            </Link>
          )}
          <span className="health-pill">
            API {healthQuery.data?.status === 'ok' ? 'Healthy' : 'Checking'}
          </span>
        </div>
      </section>

      <StatCards stats={statsQuery.data} />

      <PostFilters
        initialValues={filters}
        onApply={handleApply}
        categories={categories}
        popularTags={popularTags}
      />

      {postsQuery.isLoading ? <section className="card">Loading posts...</section> : null}
      {postsQuery.isError ? (
        <section className="card error-card">{postsQuery.error.message}</section>
      ) : null}
      {postsQuery.data ? (
        <PostList posts={postsQuery.data.items} onDelete={handleDelete} />
      ) : null}

      {pagination ? (
        <section className="card pagination-bar">
          <div>
            <strong>Page {pagination.page}</strong>
            <p className="muted">
              Showing {postsQuery.data.items.length} of {pagination.total} posts
            </p>
          </div>
          <div className="hero-actions">
            <button
              className="button ghost"
              disabled={pagination.page <= 1}
              onClick={() => changePage(pagination.page - 1)}
              type="button"
            >
              Previous
            </button>
            <button
              className="button ghost"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => changePage(pagination.page + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </section>
      ) : null}

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Popular Authors</h2>
            <p>Quick visibility into the most active contributors.</p>
          </div>
        </div>
        <div className="tag-list">
          {topAuthors.map((item) => (
            <span className="tag-chip" key={item.author}>
              {item.author} ({item.count})
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
