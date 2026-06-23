import { useEffect, useMemo, useState } from 'react';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  category: '',
  tag: '',
  sort: 'updated',
  limit: '6',
};

export function PostFilters({ initialValues, onApply, categories, popularTags }) {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialValues });

  useEffect(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initialValues });
  }, [initialValues]);

  const tagOptions = useMemo(() => popularTags?.map((item) => item.tag) ?? [], [popularTags]);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onApply(filters);
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Filters</h2>
          <p>Refine the post list with keyword, status, category and tag.</p>
        </div>
      </div>
      <form className="filters-grid" onSubmit={handleSubmit}>
        <label>
          Search
          <input
            name="search"
            value={filters.search}
            onChange={updateFilter}
            placeholder="Search title, summary, content or author"
          />
        </label>
        <label>
          Status
          <select name="status" value={filters.status} onChange={updateFilter}>
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <label>
          Category
          <select name="category" value={filters.category} onChange={updateFilter}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tag
          <input
            list="tag-options"
            name="tag"
            value={filters.tag}
            onChange={updateFilter}
            placeholder="Filter by tag"
          />
          <datalist id="tag-options">
            {tagOptions.map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </label>
        <label>
          Sort
          <select name="sort" value={filters.sort} onChange={updateFilter}>
            <option value="updated">Recently updated</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A-Z</option>
            <option value="published">Recently published</option>
          </select>
        </label>
        <label>
          Page Size
          <select name="limit" value={filters.limit} onChange={updateFilter}>
            <option value="6">6 items</option>
            <option value="9">9 items</option>
            <option value="12">12 items</option>
          </select>
        </label>
        <div className="filter-actions">
          <button type="submit" className="button primary">Apply Filters</button>
          <button type="button" className="button ghost" onClick={handleReset}>Reset</button>
        </div>
      </form>
    </section>
  );
}
