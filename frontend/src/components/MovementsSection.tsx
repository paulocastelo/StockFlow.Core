import type { FormEvent } from 'react'
import type { Product, StockBalance, StockMovement } from '../types'
import { formatDateTime } from '../utils/formatters'

type MovementsSectionProps = {
  products: Product[]
  activeProducts: Product[]
  movementForm: { productId: string; type: string; quantity: string; reason: string }
  selectedProductId: string
  balance: StockBalance | null
  movements: StockMovement[]
  isSubmitting: boolean
  isLoadingInsights: boolean
  onMovementFormChange: (form: { productId: string; type: string; quantity: string; reason: string }) => void
  onCreateMovement: (event: FormEvent<HTMLFormElement>) => void
  onProductSelect: (id: string) => void
  onGoToProducts: () => void
}

export default function MovementsSection({
  products,
  activeProducts,
  movementForm,
  selectedProductId,
  balance,
  movements,
  isSubmitting,
  isLoadingInsights,
  onMovementFormChange,
  onCreateMovement,
  onProductSelect,
  onGoToProducts,
}: MovementsSectionProps) {
  return (
    <section className="section-grid section-grid--split">
      <article className="surface nested-surface">
        <div className="panel-header"><div><span className="panel-kicker">Register</span><h3>Stock movement</h3></div></div>
        <form className="stack-form" onSubmit={onCreateMovement}>
          <label>
            Product
            <select value={movementForm.productId} onChange={(event) => onMovementFormChange({ ...movementForm, productId: event.target.value })} required>
              {activeProducts.length === 0 ? <option value="">Activate a product first</option> : null}
              {activeProducts.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
            </select>
          </label>
          <div className="two-column">
            <label>
              Movement type
              <select value={movementForm.type} onChange={(event) => onMovementFormChange({ ...movementForm, type: event.target.value })}>
                <option value="1">Entry</option>
                <option value="2">Exit</option>
              </select>
            </label>
            <label>Quantity<input type="number" min="1" step="1" value={movementForm.quantity} onChange={(event) => onMovementFormChange({ ...movementForm, quantity: event.target.value })} required /></label>
          </div>
          <label>Reason<textarea rows={4} value={movementForm.reason} onChange={(event) => onMovementFormChange({ ...movementForm, reason: event.target.value })} /></label>
          <button className="primary-button" type="submit" disabled={isSubmitting || activeProducts.length === 0}>{isSubmitting ? 'Recording...' : 'Record movement'}</button>
        </form>
        {activeProducts.length === 0 ? (
          <div className="helper-note helper-note--warning">
            Stock movements require at least one active product.
          </div>
        ) : (
          <div className="helper-note">
            Only active products are available for new stock movements.
          </div>
        )}
      </article>

      <article className="surface nested-surface">
        <div className="panel-header"><div><span className="panel-kicker">Inspect</span><h3>Balance and history</h3></div></div>
        <label className="stack-form">
          Product focus
          <select value={selectedProductId} onChange={(event) => onProductSelect(event.target.value)}>
            {products.length === 0 ? <option value="">No products yet</option> : null}
            {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
          </select>
        </label>
        <div className="balance-strip">
          <div><span>Current balance</span><strong>{isLoadingInsights ? '...' : balance?.currentBalance ?? 0}</strong></div>
          <div><span>History rows</span><strong>{isLoadingInsights ? '...' : movements.length}</strong></div>
        </div>
        <div className="list-shell">
          {products.length === 0 ? (
            <div className="empty-state compact">
              <strong>No product available for inspection.</strong>
              <p>Create a product first to inspect balance and history here.</p>
              <button className="ghost-button" type="button" onClick={onGoToProducts}>Go to products</button>
            </div>
          ) : movements.length === 0 ? <div className="empty-state compact">No movement history for the selected product yet.</div> : movements.map((movement) => (
            <article key={movement.id} className="list-card">
              <div><strong>{movement.type === 1 ? 'Entry' : 'Exit'}</strong><p>{movement.reason ?? 'No reason provided.'}</p></div>
              <div className="movement-meta"><span>{movement.quantity} units</span><span>{formatDateTime(movement.occurredAtUtc)}</span></div>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
