import type { FormEvent } from 'react'
import type { Category, Product } from '../types'
import { formatCurrency } from '../utils/formatters'

type ProductsSectionProps = {
  categories: Category[]
  products: Product[]
  filteredProducts: Product[]
  productSearch: string
  productForm: { categoryId: string; name: string; sku: string; unitPrice: string }
  editingProductId: string | null
  isSubmitting: boolean
  getCategoryName: (categoryId: string, categories: Category[]) => string
  onProductSearchChange: (value: string) => void
  onProductFormChange: (form: { categoryId: string; name: string; sku: string; unitPrice: string }) => void
  onSaveProduct: (event: FormEvent<HTMLFormElement>) => void
  onEditProduct: (product: Product) => void
  onCancelProductEdit: () => void
  onToggleProductStatus: (product: Product) => void
  onGoToCategories: () => void
}

export default function ProductsSection({
  categories,
  products,
  filteredProducts,
  productSearch,
  productForm,
  editingProductId,
  isSubmitting,
  getCategoryName,
  onProductSearchChange,
  onProductFormChange,
  onSaveProduct,
  onEditProduct,
  onCancelProductEdit,
  onToggleProductStatus,
  onGoToCategories,
}: ProductsSectionProps) {
  return (
    <section className="section-grid section-grid--split">
      <article className="surface nested-surface">
        <div className="panel-header">
          <div><span className="panel-kicker">{editingProductId ? 'Maintain' : 'Create'}</span><h3>{editingProductId ? 'Edit product' : 'New product'}</h3></div>
          {editingProductId ? <button className="ghost-button" type="button" onClick={onCancelProductEdit}>Cancel</button> : null}
        </div>
        <form className="stack-form" onSubmit={onSaveProduct}>
          <label>
            Category
            <select value={productForm.categoryId} onChange={(event) => onProductFormChange({ ...productForm, categoryId: event.target.value })} required>
              {categories.length === 0 ? <option value="">Create a category first</option> : null}
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label>Product name<input type="text" value={productForm.name} onChange={(event) => onProductFormChange({ ...productForm, name: event.target.value })} required /></label>
          <div className="two-column">
            <label>SKU<input type="text" value={productForm.sku} onChange={(event) => onProductFormChange({ ...productForm, sku: event.target.value })} required /></label>
            <label>Unit price<input type="number" min="0" step="0.01" value={productForm.unitPrice} onChange={(event) => onProductFormChange({ ...productForm, unitPrice: event.target.value })} required /></label>
          </div>
          <button className="primary-button" type="submit" disabled={isSubmitting || categories.length === 0}>{isSubmitting ? 'Saving...' : editingProductId ? 'Update product' : 'Save product'}</button>
        </form>
        {categories.length === 0 ? (
          <div className="helper-note helper-note--warning">
            Create a category first, then return here to register products.
          </div>
        ) : null}
      </article>

      <article className="surface nested-surface">
        <div className="panel-header"><div><span className="panel-kicker">Browse</span><h3>Product inventory</h3></div></div>
        <input className="search-input" type="search" placeholder="Search by name or SKU" value={productSearch} onChange={(event) => onProductSearchChange(event.target.value)} />
        <div className="list-shell">
          {categories.length === 0 ? (
            <div className="empty-state compact">
              <strong>Products depend on categories.</strong>
              <p>Set up your inventory taxonomy first to keep product data clean.</p>
              <button className="ghost-button" type="button" onClick={onGoToCategories}>Go to categories</button>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state compact">
              <strong>No products yet.</strong>
              <p>Create the first product to start recording stock activity.</p>
            </div>
          ) : filteredProducts.length === 0 ? <div className="empty-state compact">No products found for this filter.</div> : filteredProducts.map((product) => (
            <article key={product.id} className={`list-card ${editingProductId === product.id ? 'list-card--active' : ''}`}>
              <div>
                <strong>{product.name}</strong>
                <p>{product.sku} · {formatCurrency(product.unitPrice)}</p>
                <p>{getCategoryName(product.categoryId, categories)}</p>
              </div>
              <div className="inline-actions">
                <span className={`tag ${product.isActive ? 'tag--success' : 'tag--muted'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
                <button className="ghost-button" type="button" onClick={() => onToggleProductStatus(product)} disabled={isSubmitting}>
                  {product.isActive ? 'Inactivate' : 'Activate'}
                </button>
                <button className="ghost-button" type="button" onClick={() => onEditProduct(product)}>Edit</button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
