import { startTransition, useEffect, useEffectEvent, useRef, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import './App.css'
import { createCategory, deleteCategory, fetchCategories, updateCategory } from './api/categories'
import { ApiError, getErrorMessage } from './api/client'
import { createProduct, fetchProducts, updateProduct } from './api/products'
import { createMovement } from './api/stockMovements'
import AuthPanel from './components/AuthPanel'
import Feedback from './components/Feedback'
import Hero from './components/Hero'
import Workspace from './components/Workspace'
import { useAuth } from './hooks/useAuth'
import { useCategories } from './hooks/useCategories'
import { useFeedback } from './hooks/useFeedback'
import { useProducts } from './hooks/useProducts'
import { useStockMovements } from './hooks/useStockMovements'
import type { AuthResponse, Category, Product, Section } from './types'

function App() {
  const [activeSection, setActiveSection] = useState<Section>('overview')
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { token, user, expiresAtUtc, persistSession, clearSession } = useAuth()
  const { feedback, showSuccess, showError, dismiss } = useFeedback()
  const selectedProductIdRef = useRef('')
  const setSelectedProductIdRef = useRef<Dispatch<SetStateAction<string>>>(() => undefined)
  const categoriesState = useCategories(token)
  const productsState = useProducts(token, categoriesState.categories, selectedProductIdRef.current, (value) => setSelectedProductIdRef.current(value))
  const stockMovementsState = useStockMovements(token, productsState.products, handleApiError)
  const { setCategories } = categoriesState
  const { setProducts } = productsState
  const { setMovementForm, setSelectedProductId } = stockMovementsState
  selectedProductIdRef.current = stockMovementsState.selectedProductId
  setSelectedProductIdRef.current = stockMovementsState.setSelectedProductId

  function resetWorkspace() { clearSession(); setActiveSection('overview') }
  function handleApiError(error: unknown, clearExpiredSession: boolean) { if (error instanceof ApiError && error.status === 401 && clearExpiredSession) { resetWorkspace(); showError('Your session expired or is invalid. Please sign in again.'); return } showError(getErrorMessage(error)) }
  const handleApiErrorEvent = useEffectEvent((error: unknown, clearExpiredSession: boolean) => handleApiError(error, clearExpiredSession))

  useEffect(() => {
    if (!token) { setCategories([]); setProducts([]); setSelectedProductId(''); return }
    let cancelled = false
    async function bootstrap() {
      setIsBootstrapping(true)
      try {
        const [loadedCategories, loadedProducts] = await Promise.all([fetchCategories(token), fetchProducts(token)])
        if (cancelled) return
        setCategories(loadedCategories)
        setProducts(loadedProducts)
        setSelectedProductId((current) => {
          if (current && loadedProducts.some((product) => product.id === current)) {
            return current
          }

          const firstProduct = loadedProducts[0]?.id ?? ''
          setMovementForm((previous) => ({ ...previous, productId: firstProduct }))
          return firstProduct
        })
      } catch (error) {
        if (!cancelled) handleApiErrorEvent(error, true)
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    }
    void bootstrap()
    return () => { cancelled = true }
  }, [token, setCategories, setMovementForm, setProducts, setSelectedProductId])

  async function handleSaveCategory(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!token) return; setIsSubmitting(true); try { if (categoriesState.editingCategoryId) { await updateCategory(token, categoriesState.editingCategoryId, categoriesState.categoryForm); showSuccess('Category updated successfully.') } else { await createCategory(token, categoriesState.categoryForm); showSuccess('Category created successfully.') } await categoriesState.reloadCategories(); categoriesState.resetCategoryForm() } catch (error) { handleApiError(error, true) } finally { setIsSubmitting(false) } }
  async function handleSaveProduct(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!token) return; setIsSubmitting(true); try { const payload = { categoryId: productsState.productForm.categoryId, name: productsState.productForm.name, sku: productsState.productForm.sku, unitPrice: Number(productsState.productForm.unitPrice) }; if (productsState.editingProductId) { const currentProduct = productsState.products.find((product) => product.id === productsState.editingProductId); await updateProduct(token, productsState.editingProductId, { ...payload, isActive: currentProduct?.isActive ?? true }); showSuccess('Product updated successfully.') } else { await createProduct(token, payload); showSuccess('Product created successfully.') } await productsState.reloadProducts(); productsState.resetProductForm() } catch (error) { handleApiError(error, true) } finally { setIsSubmitting(false) } }
  async function handleCreateStockMovement(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!token) return; setIsSubmitting(true); try { await createMovement(token, { productId: stockMovementsState.movementForm.productId, type: Number(stockMovementsState.movementForm.type), quantity: Number(stockMovementsState.movementForm.quantity), reason: stockMovementsState.movementForm.reason.trim() || null, performedByUserId: user?.id ?? null }); await productsState.reloadProducts(); stockMovementsState.setSelectedProductId(stockMovementsState.movementForm.productId); stockMovementsState.setMovementForm((previous) => ({ ...previous, quantity: '1', reason: '' })); showSuccess('Stock movement recorded successfully.') } catch (error) { handleApiError(error, true) } finally { setIsSubmitting(false) } }
  async function handleDeleteCategory(category: Category) { if (!token || !window.confirm(`Delete category "${category.name}"? This action cannot be undone.`)) return; setIsSubmitting(true); try { await deleteCategory(token, category.id); if (categoriesState.editingCategoryId === category.id) categoriesState.resetCategoryForm(); await categoriesState.reloadCategories(); showSuccess('Category deleted successfully.') } catch (error) { handleApiError(error, true) } finally { setIsSubmitting(false) } }
  async function handleToggleProductStatus(product: Product) { if (!token) return; setIsSubmitting(true); try { await updateProduct(token, product.id, { categoryId: product.categoryId, name: product.name, sku: product.sku, unitPrice: product.unitPrice, isActive: !product.isActive }); await productsState.reloadProducts(); showSuccess(`Product ${!product.isActive ? 'activated' : 'inactivated'} successfully.`) } catch (error) { handleApiError(error, true) } finally { setIsSubmitting(false) } }

  function handleSectionChange(section: Section) { startTransition(() => setActiveSection(section)) }
  function handleLoginSuccess(response: AuthResponse) { persistSession(response); showSuccess('Welcome back. Your session is ready.') }

  return (
    <div className="app-shell">
      <Hero token={token} user={user} />
      <Feedback feedback={feedback} onDismiss={dismiss} />
      <main className="workspace-grid">
        <AuthPanel user={user} expiresAtUtc={expiresAtUtc} onLoginSuccess={handleLoginSuccess} onRegisterSuccess={() => showSuccess('Account created. You can now sign in.')} onSignOut={resetWorkspace} onError={(error) => handleApiError(error, false)} />
        <Workspace token={token} user={user} isBootstrapping={isBootstrapping} activeSection={activeSection} categories={categoriesState.categories} products={productsState.products} activeProducts={productsState.activeProducts} filteredCategories={categoriesState.filteredCategories} filteredProducts={productsState.filteredProducts} categorySearch={categoriesState.categorySearch} productSearch={productsState.productSearch} categoryForm={categoriesState.categoryForm} productForm={productsState.productForm} movementForm={stockMovementsState.movementForm} editingCategoryId={categoriesState.editingCategoryId} editingProductId={productsState.editingProductId} balance={stockMovementsState.balance} movements={stockMovementsState.movements} selectedProductId={stockMovementsState.selectedProductId} isSubmitting={isSubmitting} isLoadingInsights={stockMovementsState.isLoadingInsights} stockEntries={stockMovementsState.stockEntries} stockExits={stockMovementsState.stockExits} getCategoryName={productsState.getCategoryName} onSectionChange={handleSectionChange} onCategorySearchChange={categoriesState.setCategorySearch} onProductSearchChange={productsState.setProductSearch} onCategoryFormChange={categoriesState.setCategoryForm} onProductFormChange={productsState.setProductForm} onMovementFormChange={stockMovementsState.setMovementForm} onSaveCategory={handleSaveCategory} onSaveProduct={handleSaveProduct} onCreateMovement={handleCreateStockMovement} onEditCategory={categoriesState.startCategoryEdit} onCancelCategoryEdit={categoriesState.resetCategoryForm} onDeleteCategory={handleDeleteCategory} onEditProduct={productsState.startProductEdit} onCancelProductEdit={productsState.resetProductForm} onToggleProductStatus={handleToggleProductStatus} onProductSelect={stockMovementsState.setSelectedProductId} />
      </main>
    </div>
  )
}

export default App
