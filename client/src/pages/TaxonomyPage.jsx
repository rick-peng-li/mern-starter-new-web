import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  fetchCategories,
  fetchTags,
  updateCategory,
  updateTag,
} from '../lib/api.js';

function TaxonomySection({ title, description, items, onCreate, onRename, onDelete, entityName }) {
  async function handleCreate(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name')?.toString().trim();
    const descriptionValue = formData.get('description')?.toString().trim() || '';

    if (!name) {
      return;
    }

    await onCreate({ name, description: descriptionValue });
    event.currentTarget.reset();
  }

  return (
    <section className="card taxonomy-card">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <form className="taxonomy-form" onSubmit={handleCreate}>
        <input name="name" placeholder={`New ${entityName} name`} required />
        <input name="description" placeholder="Description (optional)" />
        <button className="button primary" type="submit">Add</button>
      </form>
      <div className="taxonomy-list">
        {items.map((item) => (
          <article className="taxonomy-item" key={item._id}>
            <div>
              <strong>{item.name}</strong>
              <p className="muted">{item.description || 'No description yet.'}</p>
              <span className="muted">Usage: {item.usageCount}</span>
            </div>
            <div className="taxonomy-actions">
              <button
                className="button ghost"
                onClick={() => {
                  const nextName = window.prompt(`Rename ${entityName}`, item.name);
                  if (nextName) {
                    onRename(item._id, { name: nextName, description: item.description || '' });
                  }
                }}
                type="button"
              >
                Rename
              </button>
              <button className="button danger" onClick={() => onDelete(item._id)} type="button">
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TaxonomyPage() {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const tagsQuery = useQuery({ queryKey: ['tags'], queryFn: fetchTags });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['tags'] });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  const createCategoryMutation = useMutation({ mutationFn: createCategory, onSuccess: refresh });
  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, payload }) => updateCategory(categoryId, payload),
    onSuccess: refresh,
  });
  const deleteCategoryMutation = useMutation({ mutationFn: deleteCategory, onSuccess: refresh });

  const createTagMutation = useMutation({ mutationFn: createTag, onSuccess: refresh });
  const updateTagMutation = useMutation({
    mutationFn: ({ tagId, payload }) => updateTag(tagId, payload),
    onSuccess: refresh,
  });
  const deleteTagMutation = useMutation({ mutationFn: deleteTag, onSuccess: refresh });

  if (categoriesQuery.isLoading || tagsQuery.isLoading) {
    return <section className="card">Loading taxonomy...</section>;
  }

  if (categoriesQuery.isError || tagsQuery.isError) {
    return <section className="card error-card">Failed to load taxonomy data.</section>;
  }

  return (
    <div className="page-stack two-column-grid">
      <TaxonomySection
        title="Category Management"
        description="Create, rename and remove categories used by editorial posts."
        entityName="category"
        items={categoriesQuery.data?.items || []}
        onCreate={(payload) => createCategoryMutation.mutateAsync(payload)}
        onRename={(categoryId, payload) => updateCategoryMutation.mutateAsync({ categoryId, payload })}
        onDelete={(categoryId) => {
          if (window.confirm('Delete this category? Posts using it will move to General.')) {
            return deleteCategoryMutation.mutateAsync(categoryId);
          }

          return Promise.resolve();
        }}
      />
      <TaxonomySection
        title="Tag Management"
        description="Maintain reusable tags and keep the content taxonomy clean."
        entityName="tag"
        items={tagsQuery.data?.items || []}
        onCreate={(payload) => createTagMutation.mutateAsync(payload)}
        onRename={(tagId, payload) => updateTagMutation.mutateAsync({ tagId, payload })}
        onDelete={(tagId) => {
          if (window.confirm('Delete this tag? It will be removed from all posts.')) {
            return deleteTagMutation.mutateAsync(tagId);
          }

          return Promise.resolve();
        }}
      />
    </div>
  );
}
