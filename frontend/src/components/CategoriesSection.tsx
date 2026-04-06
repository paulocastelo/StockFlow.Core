import type { FormEvent } from 'react'
import type { Category } from '../types'

type CategoriesSectionProps = {
  categories: Category[]
  filteredCategories: Category[]
  categorySearch: string
  categoryForm: { name: string; description: string }
  editingCategoryId: string | null
  isSubmitting: boolean
  onCategorySearchChange: (value: string) => void
  onCategoryFormChange: (form: { name: string; description: string }) => void
  onSaveCategory: (event: FormEvent<HTMLFormElement>) => void
  onEditCategory: (category: Category) => void
  onCancelCategoryEdit: () => void
  onDeleteCategory: (category: Category) => void
}

export default function CategoriesSection({
  categories,
  filteredCategories,
  categorySearch,
  categoryForm,
  editingCategoryId,
  isSubmitting,
  onCategorySearchChange,
  onCategoryFormChange,
  onSaveCategory,
  onEditCategory,
  onCancelCategoryEdit,
  onDeleteCategory,
}: CategoriesSectionProps) {
  return (
    <section className="section-grid section-grid--split">
      <article className="surface nested-surface">
        <div className="panel-header">
          <div><span className="panel-kicker">{editingCategoryId ? 'Maintain' : 'Create'}</span><h3>{editingCategoryId ? 'Edit category' : 'New category'}</h3></div>
          {editingCategoryId ? <button className="ghost-button" type="button" onClick={onCancelCategoryEdit}>Cancel</button> : null}
        </div>
        <form className="stack-form" onSubmit={onSaveCategory}>
          <label>Name<input type="text" value={categoryForm.name} onChange={(event) => onCategoryFormChange({ ...categoryForm, name: event.target.value })} required /></label>
          <label>Description<textarea rows={4} value={categoryForm.description} onChange={(event) => onCategoryFormChange({ ...categoryForm, description: event.target.value })} /></label>
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editingCategoryId ? 'Update category' : 'Save category'}</button>
        </form>
      </article>

      <article className="surface nested-surface">
        <div className="panel-header"><div><span className="panel-kicker">Browse</span><h3>Category catalog</h3></div></div>
        <input className="search-input" type="search" placeholder="Search categories" value={categorySearch} onChange={(event) => onCategorySearchChange(event.target.value)} />
        <div className="list-shell">
          {categories.length === 0 ? (
            <div className="empty-state compact">
              <strong>No categories yet.</strong>
              <p>Create your first category to unlock product registration.</p>
            </div>
          ) : filteredCategories.length === 0 ? <div className="empty-state compact">No categories found for this filter.</div> : filteredCategories.map((category) => (
            <article key={category.id} className={`list-card ${editingCategoryId === category.id ? 'list-card--active' : ''}`}>
              <div><strong>{category.name}</strong><p>{category.description ?? 'No description yet.'}</p></div>
              <div className="inline-actions">
                <button className="ghost-button" type="button" onClick={() => onEditCategory(category)}>Edit</button>
                <button className="danger-button" type="button" onClick={() => onDeleteCategory(category)} disabled={isSubmitting}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
