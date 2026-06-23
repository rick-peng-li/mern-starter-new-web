import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, statusClassName } from '../lib/formatters.js';

export function PostList({ posts, onDelete }) {
  const { isAuthenticated } = useAuth();

  if (!posts.length) {
    return (
      <section className="card empty-state">
        <h2>No posts found</h2>
        <p>Create a new article or widen your filters to see more content.</p>
      </section>
    );
  }

  return (
    <section className="list-grid">
      {posts.map((post) => (
        <article className="card post-card" key={post.publicId}>
          <div className="post-card-top">
            <span className={statusClassName(post.status)}>{post.status}</span>
            <span className="muted">Updated {formatDate(post.updatedAt)}</span>
          </div>
          <div className="post-card-body">
            <h3>{post.title}</h3>
            <p className="muted">{post.summary}</p>
            <div className="meta-grid">
              <span><strong>Author:</strong> {post.author}</span>
              <span><strong>Category:</strong> {post.category}</span>
              <span><strong>Reading:</strong> {post.readingMinutes} min</span>
              <span><strong>Edited By:</strong> {post.lastEditedBy || post.author}</span>
            </div>
            <div className="tag-list">
              {post.tags.map((tag) => (
                <span className="tag-chip" key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="post-card-actions">
            <Link className="button ghost" to={`/posts/${post.publicId}`}>View</Link>
            {isAuthenticated ? <Link className="button ghost" to={`/posts/${post.publicId}/edit`}>Edit</Link> : null}
            {isAuthenticated ? (
              <button className="button danger" type="button" onClick={() => onDelete(post)}>
                Delete
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}
