import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

function toCommaSeparatedTags(tags) {
  return Array.isArray(tags) ? tags.join(', ') : '';
}

function buildInitialState(post) {
  return {
    title: post?.title ?? '',
    summary: post?.summary ?? '',
    content: post?.content ?? '',
    author: post?.author ?? '',
    category: post?.category ?? '',
    tags: toCommaSeparatedTags(post?.tags),
    contentFormat: post?.contentFormat ?? 'markdown',
    status: post?.status ?? 'draft',
    coverImage: post?.coverImage ?? '',
  };
}

export function PostForm({
  post,
  onSubmit,
  isSubmitting,
  currentUser,
  categories,
  tags,
  onUploadImage,
  uploadError,
  isUploading,
}) {
  const [form, setForm] = useState(buildInitialState(post));
  const formTitle = useMemo(() => (post ? 'Edit Post' : 'Create Post'), [post]);

  useEffect(() => {
    setForm(buildInitialState(post));
  }, [post]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleUpload(event, target) {
    const [file] = event.target.files || [];

    if (!file) {
      return;
    }

    try {
      const response = await onUploadImage(file);

      if (target === 'cover') {
        setForm((current) => ({ ...current, coverImage: response.file.url }));
      }

      if (target === 'content') {
        setForm((current) => ({
          ...current,
          content: `${current.content}\n\n![${file.name}](${response.file.url})`,
        }));
      }
    } catch (error) {
      return;
    }

    event.target.value = '';
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      author: currentUser?.name || form.author,
      tags: form.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    });
  }

  return (
    <form className="card editor-form" onSubmit={handleSubmit}>
      <div className="section-header">
        <div>
          <h2>{formTitle}</h2>
          <p>Use Markdown editing, upload media and maintain taxonomy in one form.</p>
        </div>
      </div>
      <div className="editor-grid">
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Author
          <input name="author" value={currentUser?.name || form.author} onChange={handleChange} required readOnly={Boolean(currentUser?.name)} />
        </label>
        <label>
          Category
          <input list="category-options" name="category" value={form.category} onChange={handleChange} required />
          <datalist id="category-options">
            {categories.map((category) => (
              <option key={category._id} value={category.name} />
            ))}
          </datalist>
        </label>
        <label>
          Status
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="full-width">
          Summary
          <textarea name="summary" rows="3" value={form.summary} onChange={handleChange} required />
        </label>
        <label className="full-width">
          Content
          <textarea name="content" rows="10" value={form.content} onChange={handleChange} required />
        </label>
        <label className="full-width">
          Cover Image URL
          <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="https://example.com/cover.jpg" />
        </label>
        <div className="full-width upload-actions">
          <label className="upload-control">
            <span>Upload Cover</span>
            <input type="file" accept="image/*" onChange={(event) => handleUpload(event, 'cover')} />
          </label>
          <label className="upload-control">
            <span>Insert Content Image</span>
            <input type="file" accept="image/*" onChange={(event) => handleUpload(event, 'content')} />
          </label>
          <span className="muted">{isUploading ? 'Uploading image...' : 'Upload images up to 3MB.'}</span>
        </div>
        {uploadError ? <p className="form-error full-width">{uploadError}</p> : null}
        <label className="full-width">
          Tags
          <input
            list="tag-options-editor"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="react, express, mongodb"
          />
          <datalist id="tag-options-editor">
            {tags.map((tag) => (
              <option key={tag._id} value={tag.name} />
            ))}
          </datalist>
        </label>
      </div>
      <div className="markdown-preview card-subsection">
        <h3>Markdown Preview</h3>
        <div className="content-block">
          <ReactMarkdown>{form.content || 'Nothing to preview yet.'}</ReactMarkdown>
        </div>
      </div>
      <div className="form-actions">
        <button className="button primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </form>
  );
}
