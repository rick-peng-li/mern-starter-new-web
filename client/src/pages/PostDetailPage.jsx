import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchPost } from '../lib/api.js';
import { formatDate, statusClassName } from '../lib/formatters.js';

export function PostDetailPage() {
  const { postId } = useParams();
  const { isAuthenticated } = useAuth();
  const postQuery = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  });

  if (postQuery.isLoading) {
    return <section className="card">Loading post details...</section>;
  }

  if (postQuery.isError) {
    return <section className="card error-card">{postQuery.error.message}</section>;
  }

  const { item: post } = postQuery.data;

  return (
    <article className="page-stack">
      <section className="card detail-card">
        <div className="detail-header">
          <div>
            <span className={statusClassName(post.status)}>{post.status}</span>
            <h1>{post.title}</h1>
            <p className="muted">{post.summary}</p>
          </div>
          {isAuthenticated ? (
            <Link className="button ghost" to={`/posts/${post.publicId}/edit`}>
              Edit Post
            </Link>
          ) : null}
        </div>
        {post.coverImage ? <img className="detail-cover" src={post.coverImage} alt={post.title} /> : null}
        <div className="detail-meta">
          <span><strong>Author:</strong> {post.author}</span>
          <span><strong>Category:</strong> {post.category}</span>
          <span><strong>Reading:</strong> {post.readingMinutes} min</span>
          <span><strong>Edited By:</strong> {post.lastEditedBy || post.author}</span>
          <span><strong>Created:</strong> {formatDate(post.createdAt)}</span>
          <span><strong>Updated:</strong> {formatDate(post.updatedAt)}</span>
        </div>
        <div className="tag-list">
          {post.tags.map((tag) => (
            <span className="tag-chip" key={tag}>{tag}</span>
          ))}
        </div>
        <div className="content-block">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </section>
    </article>
  );
}
