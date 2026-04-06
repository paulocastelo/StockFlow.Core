import type { Category, Product, StockBalance, StockMovement } from '../types'

type OverviewSectionProps = {
  categories: Category[]
  products: Product[]
  movements: StockMovement[]
  balance: StockBalance | null
  selectedProductId: string
  isLoadingInsights: boolean
  stockEntries: number
  stockExits: number
  readinessItems: Array<{ label: string; done: boolean }>
  onProductSelect: (id: string) => void
}

export default function OverviewSection({
  categories,
  products,
  movements,
  balance,
  selectedProductId,
  isLoadingInsights,
  stockEntries,
  stockExits,
  readinessItems,
  onProductSelect,
}: OverviewSectionProps) {
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null

  return (
    <section className="section-grid">
      <article className="metric-card"><span>Categories</span><strong>{categories.length}</strong><p>Current product taxonomy available to the operation.</p></article>
      <article className="metric-card"><span>Products</span><strong>{products.length}</strong><p>Registered inventory items with SKU and pricing metadata.</p></article>
      <article className="metric-card"><span>Entries</span><strong>{stockEntries}</strong><p>Recorded inbound stock for the selected product history.</p></article>
      <article className="metric-card"><span>Exits</span><strong>{stockExits}</strong><p>Recorded outbound stock for the selected product history.</p></article>

      <article className="wide-card">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">Quick focus</span>
            <h3>Tracked product balance</h3>
          </div>
        </div>

        <select value={selectedProductId} onChange={(event) => onProductSelect(event.target.value)} disabled={products.length === 0}>
          {products.length === 0 ? <option value="">No products yet</option> : null}
          {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
        </select>

        <div className="balance-strip">
          <div><span>Current balance</span><strong>{balance?.currentBalance ?? 0}</strong></div>
          <div><span>Tracked movements</span><strong>{isLoadingInsights ? '...' : movements.length}</strong></div>
        </div>

        <div className="helper-note">
          {selectedProduct ? `${selectedProduct.name} is currently ${selectedProduct.isActive ? 'active' : 'inactive'} for operations.` : 'Create a product to start tracking operational balance.'}
        </div>
      </article>

      <article className="wide-card">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">Readiness</span>
            <h3>Operational checklist</h3>
          </div>
        </div>

        <div className="checklist-grid">
          {readinessItems.map((item) => (
            <article key={item.label} className={`checklist-card ${item.done ? 'checklist-card--done' : ''}`}>
              <strong>{item.done ? 'Done' : 'Pending'}</strong>
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
