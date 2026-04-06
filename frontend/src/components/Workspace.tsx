import type { FormEvent } from 'react'
import type { Category, Product, Section, SectionMeta, StockBalance, StockMovement, UserProfile } from '../types'
import CategoriesSection from './CategoriesSection'
import MovementsSection from './MovementsSection'
import OverviewSection from './OverviewSection'
import ProductsSection from './ProductsSection'

type WorkspaceProps = {
  token: string
  user: UserProfile | null
  isBootstrapping: boolean
  activeSection: Section
  categories: Category[]
  products: Product[]
  activeProducts: Product[]
  filteredCategories: Category[]
  filteredProducts: Product[]
  categorySearch: string
  productSearch: string
  categoryForm: { name: string; description: string }
  productForm: { categoryId: string; name: string; sku: string; unitPrice: string }
  movementForm: { productId: string; type: string; quantity: string; reason: string }
  editingCategoryId: string | null
  editingProductId: string | null
  balance: StockBalance | null
  movements: StockMovement[]
  selectedProductId: string
  isSubmitting: boolean
  isLoadingInsights: boolean
  stockEntries: number
  stockExits: number
  getCategoryName: (categoryId: string, categories: Category[]) => string
  onSectionChange: (section: Section) => void
  onCategorySearchChange: (value: string) => void
  onProductSearchChange: (value: string) => void
  onCategoryFormChange: (form: { name: string; description: string }) => void
  onProductFormChange: (form: { categoryId: string; name: string; sku: string; unitPrice: string }) => void
  onMovementFormChange: (form: { productId: string; type: string; quantity: string; reason: string }) => void
  onSaveCategory: (event: FormEvent<HTMLFormElement>) => void
  onSaveProduct: (event: FormEvent<HTMLFormElement>) => void
  onCreateMovement: (event: FormEvent<HTMLFormElement>) => void
  onEditCategory: (category: Category) => void
  onCancelCategoryEdit: () => void
  onDeleteCategory: (category: Category) => void
  onEditProduct: (product: Product) => void
  onCancelProductEdit: () => void
  onToggleProductStatus: (product: Product) => void
  onProductSelect: (id: string) => void
}

const sectionMeta: Record<Section, SectionMeta> = {
  overview: {
    title: 'Operational overview',
    description: 'Track readiness, inspect inventory balance, and keep the main workflow visible at a glance.',
  },
  categories: {
    title: 'Category management',
    description: 'Organize inventory structure before creating products and downstream stock activity.',
  },
  products: {
    title: 'Product management',
    description: 'Register sellable items, maintain their metadata, and control whether they stay operational.',
  },
  movements: {
    title: 'Stock movements',
    description: 'Record entries and exits against active products while watching current balance and history.',
  },
}

export default function Workspace({
  token,
  user,
  isBootstrapping,
  activeSection,
  categories,
  products,
  activeProducts,
  filteredCategories,
  filteredProducts,
  categorySearch,
  productSearch,
  categoryForm,
  productForm,
  movementForm,
  editingCategoryId,
  editingProductId,
  balance,
  movements,
  selectedProductId,
  isSubmitting,
  isLoadingInsights,
  stockEntries,
  stockExits,
  getCategoryName,
  onSectionChange,
  onCategorySearchChange,
  onProductSearchChange,
  onCategoryFormChange,
  onProductFormChange,
  onMovementFormChange,
  onSaveCategory,
  onSaveProduct,
  onCreateMovement,
  onEditCategory,
  onCancelCategoryEdit,
  onDeleteCategory,
  onEditProduct,
  onCancelProductEdit,
  onToggleProductStatus,
  onProductSelect,
}: WorkspaceProps) {
  const currentSection = sectionMeta[activeSection]
  const readinessItems = [
    { label: 'Authenticated session', done: Boolean(token && user) },
    { label: 'At least one category created', done: categories.length > 0 },
    { label: 'At least one product created', done: products.length > 0 },
    { label: 'At least one active product available', done: activeProducts.length > 0 },
  ]
  const completedReadinessCount = readinessItems.filter((item) => item.done).length

  return (
    <section className="content-panel surface">
      <div className="panel-header">
        <div>
          <span className="panel-kicker">Operations</span>
          <h2>Inventory workspace</h2>
        </div>
        <div className="inline-stats">
          <span>{categories.length} categories</span>
          <span>{products.length} products</span>
          <span>{balance?.currentBalance ?? 0} current units</span>
        </div>
      </div>

      <nav className="section-nav">
        <button className={activeSection === 'overview' ? 'is-active' : ''} onClick={() => onSectionChange('overview')}>Overview</button>
        <button className={activeSection === 'categories' ? 'is-active' : ''} onClick={() => onSectionChange('categories')}>Categories</button>
        <button className={activeSection === 'products' ? 'is-active' : ''} onClick={() => onSectionChange('products')}>Products</button>
        <button className={activeSection === 'movements' ? 'is-active' : ''} onClick={() => onSectionChange('movements')}>Movements</button>
      </nav>

      <div className="section-summary">
        <div>
          <span className="panel-kicker">Current focus</span>
          <h3>{currentSection.title}</h3>
          <p>{currentSection.description}</p>
        </div>
        {token ? (
          <span className="summary-pill">
            {completedReadinessCount}/{readinessItems.length} readiness checks complete
          </span>
        ) : (
          <span className="summary-pill">Sign in to unlock operational flows</span>
        )}
      </div>

      {isBootstrapping ? <div className="empty-state">Loading inventory data...</div> : null}
      {!token ? <div className="empty-state">Sign in to load categories, products, and stock movement data.</div> : null}

      {token && !isBootstrapping && activeSection === 'overview' ? (
        <OverviewSection
          categories={categories}
          products={products}
          movements={movements}
          balance={balance}
          selectedProductId={selectedProductId}
          isLoadingInsights={isLoadingInsights}
          stockEntries={stockEntries}
          stockExits={stockExits}
          readinessItems={readinessItems}
          onProductSelect={onProductSelect}
        />
      ) : null}

      {token && !isBootstrapping && activeSection === 'categories' ? (
        <CategoriesSection
          categories={categories}
          filteredCategories={filteredCategories}
          categorySearch={categorySearch}
          categoryForm={categoryForm}
          editingCategoryId={editingCategoryId}
          isSubmitting={isSubmitting}
          onCategorySearchChange={onCategorySearchChange}
          onCategoryFormChange={onCategoryFormChange}
          onSaveCategory={onSaveCategory}
          onEditCategory={onEditCategory}
          onCancelCategoryEdit={onCancelCategoryEdit}
          onDeleteCategory={onDeleteCategory}
        />
      ) : null}

      {token && !isBootstrapping && activeSection === 'products' ? (
        <ProductsSection
          categories={categories}
          products={products}
          filteredProducts={filteredProducts}
          productSearch={productSearch}
          productForm={productForm}
          editingProductId={editingProductId}
          isSubmitting={isSubmitting}
          getCategoryName={getCategoryName}
          onProductSearchChange={onProductSearchChange}
          onProductFormChange={onProductFormChange}
          onSaveProduct={onSaveProduct}
          onEditProduct={onEditProduct}
          onCancelProductEdit={onCancelProductEdit}
          onToggleProductStatus={onToggleProductStatus}
          onGoToCategories={() => onSectionChange('categories')}
        />
      ) : null}

      {token && !isBootstrapping && activeSection === 'movements' ? (
        <MovementsSection
          products={products}
          activeProducts={activeProducts}
          movementForm={movementForm}
          selectedProductId={selectedProductId}
          balance={balance}
          movements={movements}
          isSubmitting={isSubmitting}
          isLoadingInsights={isLoadingInsights}
          onMovementFormChange={onMovementFormChange}
          onCreateMovement={onCreateMovement}
          onProductSelect={onProductSelect}
          onGoToProducts={() => onSectionChange('products')}
        />
      ) : null}
    </section>
  )
}
