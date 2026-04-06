import { startTransition, useDeferredValue, useEffect, useEffectEvent, useState } from 'react'
import './App.css'

type Section = 'overview' | 'categories' | 'products' | 'movements'
type AuthMode = 'login' | 'register'

type UserProfile = {
  id: string
  fullName: string
  email: string
  isActive: boolean
}

type AuthResponse = {
  accessToken: string
  expiresAtUtc: string
  user: UserProfile
}

type Category = {
  id: string
  name: string
  description: string | null
}

type Product = {
  id: string
  categoryId: string
  name: string
  sku: string
  unitPrice: number
  isActive: boolean
}

type StockMovement = {
  id: string
  productId: string
  type: number
  quantity: number
  reason: string | null
  occurredAtUtc: string
}

type StockBalance = {
  productId: string
  currentBalance: number
}

type Feedback = {
  tone: 'success' | 'error'
  message: string
}

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string
  body?: unknown
}

type SectionMeta = {
  title: string
  description: string
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

const emptyLogin = { email: '', password: '' }
const emptyRegister = { fullName: '', email: '', password: '' }
const emptyCategory = { name: '', description: '' }
const emptyProduct = { categoryId: '', name: '', sku: '', unitPrice: '0' }
const emptyMovement = { productId: '', type: '1', quantity: '1', reason: '' }

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

function App() {
  const [activeSection, setActiveSection] = useState<Section>('overview')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [token, setToken] = useState<string>(() => localStorage.getItem('stockflow.token') ?? '')
  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('stockflow.user')
    return raw ? (JSON.parse(raw) as UserProfile) : null
  })
  const [expiresAtUtc, setExpiresAtUtc] = useState<string>(() => localStorage.getItem('stockflow.expiresAtUtc') ?? '')

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [balance, setBalance] = useState<StockBalance | null>(null)

  const [selectedProductId, setSelectedProductId] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [categorySearch, setCategorySearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const deferredCategorySearch = useDeferredValue(categorySearch)
  const deferredProductSearch = useDeferredValue(productSearch)

  const [loginForm, setLoginForm] = useState(emptyLogin)
  const [registerForm, setRegisterForm] = useState(emptyRegister)
  const [categoryForm, setCategoryForm] = useState(emptyCategory)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [movementForm, setMovementForm] = useState(emptyMovement)

  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const handleApiError = (error: unknown, clearExpiredSession: boolean) => {
    if (error instanceof ApiError && error.status === 401 && clearExpiredSession) {
      clearSession()
      setFeedback({ tone: 'error', message: 'Your session expired or is invalid. Please sign in again.' })
      return
    }

    setFeedback({ tone: 'error', message: getErrorMessage(error) })
  }

  const handleApiErrorEvent = useEffectEvent((error: unknown, clearExpiredSession: boolean) => {
    handleApiError(error, clearExpiredSession)
  })

  useEffect(() => {
    if (!token) {
      setCategories([])
      setProducts([])
      setMovements([])
      setBalance(null)
      setSelectedProductId('')
      return
    }

    let cancelled = false

    async function bootstrap() {
      setIsBootstrapping(true)

      try {
        const [loadedCategories, loadedProducts] = await Promise.all([
          apiRequest<Category[]>('/api/categories', { token }),
          apiRequest<Product[]>('/api/products', { token }),
        ])

        if (cancelled) {
          return
        }

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
        if (!cancelled) {
          handleApiErrorEvent(error, true)
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (!token || !selectedProductId) {
      setMovements([])
      setBalance(null)
      return
    }

    let cancelled = false

    async function loadProductInsights() {
      setIsLoadingInsights(true)

      try {
        const [loadedMovements, loadedBalance] = await Promise.all([
          apiRequest<StockMovement[]>(`/api/stock-movements/product/${selectedProductId}`, { token }),
          apiRequest<StockBalance>(`/api/stock-movements/product/${selectedProductId}/balance`, { token }),
        ])

        if (cancelled) {
          return
        }

        setMovements(loadedMovements)
        setBalance(loadedBalance)
      } catch (error) {
        if (!cancelled) {
          handleApiErrorEvent(error, false)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingInsights(false)
        }
      }
    }

    void loadProductInsights()

    return () => {
      cancelled = true
    }
  }, [selectedProductId, token])

  useEffect(() => {
    if (!productForm.categoryId && categories.length > 0) {
      setProductForm((previous) => ({ ...previous, categoryId: categories[0].id }))
    }
  }, [categories, productForm.categoryId])

  useEffect(() => {
    if (!movementForm.productId && products.length > 0) {
      setMovementForm((previous) => ({ ...previous, productId: products[0].id }))
    }
  }, [movementForm.productId, products])

  const filteredCategories = categories.filter((category) => {
    const query = deferredCategorySearch.trim().toLowerCase()
    if (!query) {
      return true
    }

    return `${category.name} ${category.description ?? ''}`.toLowerCase().includes(query)
  })

  const filteredProducts = products.filter((product) => {
    const query = deferredProductSearch.trim().toLowerCase()
    if (!query) {
      return true
    }

    return `${product.name} ${product.sku}`.toLowerCase().includes(query)
  })

  const stockEntries = movements.filter((movement) => movement.type === 1).reduce((total, movement) => total + movement.quantity, 0)
  const stockExits = movements.filter((movement) => movement.type === 2).reduce((total, movement) => total + movement.quantity, 0)
  const activeProducts = products.filter((product) => product.isActive)
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null
  const currentSection = sectionMeta[activeSection]
  const readinessItems = [
    { label: 'Authenticated session', done: Boolean(token && user) },
    { label: 'At least one category created', done: categories.length > 0 },
    { label: 'At least one product created', done: products.length > 0 },
    { label: 'At least one active product available', done: activeProducts.length > 0 },
  ]
  const completedReadinessCount = readinessItems.filter((item) => item.done).length

  function persistSession(response: AuthResponse) {
    localStorage.setItem('stockflow.token', response.accessToken)
    localStorage.setItem('stockflow.user', JSON.stringify(response.user))
    localStorage.setItem('stockflow.expiresAtUtc', response.expiresAtUtc)

    setToken(response.accessToken)
    setUser(response.user)
    setExpiresAtUtc(response.expiresAtUtc)
  }

  function clearSession() {
    localStorage.removeItem('stockflow.token')
    localStorage.removeItem('stockflow.user')
    localStorage.removeItem('stockflow.expiresAtUtc')

    setToken('')
    setUser(null)
    setExpiresAtUtc('')
    setActiveSection('overview')
    setLoginForm(emptyLogin)
    setRegisterForm(emptyRegister)
  }

  async function reloadCategories() {
    if (!token) return
    setCategories(await apiRequest<Category[]>('/api/categories', { token }))
  }

  async function reloadProducts() {
    if (!token) return
    const loadedProducts = await apiRequest<Product[]>('/api/products', { token })
    setProducts(loadedProducts)

    if (loadedProducts.length > 0 && !loadedProducts.some((product) => product.id === selectedProductId)) {
      const nextProductId = loadedProducts[0].id
      setSelectedProductId(nextProductId)
      setMovementForm((previous) => ({ ...previous, productId: nextProductId }))
    }
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: loginForm,
      })

      persistSession(response)
      setFeedback({ tone: 'success', message: 'Welcome back. Your session is ready.' })
      setLoginForm(emptyLogin)
    } catch (error) {
      handleApiError(error, false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await apiRequest<UserProfile>('/api/auth/register', {
        method: 'POST',
        body: registerForm,
      })

      setFeedback({ tone: 'success', message: 'Account created. You can now sign in.' })
      setRegisterForm(emptyRegister)
      setAuthMode('login')
    } catch (error) {
      handleApiError(error, false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return

    setIsSubmitting(true)
    try {
      if (editingCategoryId) {
        await apiRequest(`/api/categories/${editingCategoryId}`, {
          method: 'PUT',
          token,
          body: categoryForm,
        })

        setFeedback({ tone: 'success', message: 'Category updated successfully.' })
      } else {
        await apiRequest('/api/categories', {
          method: 'POST',
          token,
          body: categoryForm,
        })

        setFeedback({ tone: 'success', message: 'Category created successfully.' })
      }

      await reloadCategories()
      resetCategoryForm()
    } catch (error) {
      handleApiError(error, true)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return

    setIsSubmitting(true)
    try {
      const payload = {
        categoryId: productForm.categoryId,
        name: productForm.name,
        sku: productForm.sku,
        unitPrice: Number(productForm.unitPrice),
      }

      if (editingProductId) {
        const currentProduct = products.find((product) => product.id === editingProductId)

        await apiRequest(`/api/products/${editingProductId}`, {
          method: 'PUT',
          token,
          body: {
            ...payload,
            isActive: currentProduct?.isActive ?? true,
          },
        })

        setFeedback({ tone: 'success', message: 'Product updated successfully.' })
      } else {
        await apiRequest('/api/products', {
          method: 'POST',
          token,
          body: payload,
        })

        setFeedback({ tone: 'success', message: 'Product created successfully.' })
      }

      await reloadProducts()
      resetProductForm()
    } catch (error) {
      handleApiError(error, true)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreateMovement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return

    setIsSubmitting(true)
    try {
      await apiRequest('/api/stock-movements', {
        method: 'POST',
        token,
        body: {
          productId: movementForm.productId,
          type: Number(movementForm.type),
          quantity: Number(movementForm.quantity),
          reason: movementForm.reason.trim() || null,
          performedByUserId: user?.id ?? null,
        },
      })

      await reloadProducts()
      setSelectedProductId(movementForm.productId)
      setMovementForm((previous) => ({ ...previous, quantity: '1', reason: '' }))
      setFeedback({ tone: 'success', message: 'Stock movement recorded successfully.' })
    } catch (error) {
      handleApiError(error, true)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteCategory(category: Category) {
    if (!token) return

    const shouldDelete = window.confirm(`Delete category "${category.name}"? This action cannot be undone.`)
    if (!shouldDelete) {
      return
    }

    setIsSubmitting(true)
    try {
      await apiRequest(`/api/categories/${category.id}`, {
        method: 'DELETE',
        token,
      })

      if (editingCategoryId === category.id) {
        resetCategoryForm()
      }

      await reloadCategories()
      setFeedback({ tone: 'success', message: 'Category deleted successfully.' })
    } catch (error) {
      handleApiError(error, true)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleProductStatus(product: Product) {
    if (!token) return

    const nextIsActive = !product.isActive

    setIsSubmitting(true)
    try {
      await apiRequest(`/api/products/${product.id}`, {
        method: 'PUT',
        token,
        body: {
          categoryId: product.categoryId,
          name: product.name,
          sku: product.sku,
          unitPrice: product.unitPrice,
          isActive: nextIsActive,
        },
      })

      await reloadProducts()
      setFeedback({
        tone: 'success',
        message: `Product ${nextIsActive ? 'activated' : 'inactivated'} successfully.`,
      })
    } catch (error) {
      handleApiError(error, true)
    } finally {
      setIsSubmitting(false)
    }
  }

  function changeSection(section: Section) {
    startTransition(() => {
      setActiveSection(section)
    })
  }

  function startCategoryEdit(category: Category) {
    setEditingCategoryId(category.id)
    setCategoryForm({
      name: category.name,
      description: category.description ?? '',
    })
  }

  function resetCategoryForm() {
    setEditingCategoryId(null)
    setCategoryForm(emptyCategory)
  }

  function startProductEdit(product: Product) {
    setEditingProductId(product.id)
    setProductForm({
      categoryId: product.categoryId,
      name: product.name,
      sku: product.sku,
      unitPrice: String(product.unitPrice),
    })
  }

  function resetProductForm() {
    setEditingProductId(null)
    setProductForm({
      categoryId: categories[0]?.id ?? '',
      name: '',
      sku: '',
      unitPrice: '0',
    })
  }

  function getCategoryName(categoryId: string) {
    return categories.find((category) => category.id === categoryId)?.name ?? 'Unassigned category'
  }

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">StockFlow Core</span>
          <h1>Inventory control with a clean operational cockpit.</h1>
          <p>
            This web MVP connects directly to the ASP.NET Core API and supports authentication, category and
            product management, stock entries, stock exits, balance lookup, and movement history.
          </p>
        </div>

        <div className="status-card">
          <span className="status-label">Backend status</span>
          <strong>{token ? 'Connected with JWT session' : 'Ready for sign-in'}</strong>
          <p>API base URL: {apiBaseUrl}</p>
          {user ? <p>Signed in as {user.fullName}</p> : <p>Use the auth panel to begin operating the workspace.</p>}
        </div>
      </header>

      {feedback ? (
        <div className={`feedback feedback--${feedback.tone}`}>
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <main className="workspace-grid">
        <section className="auth-panel surface">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Access</span>
              <h2>Session control</h2>
            </div>
            {user ? (
              <button className="ghost-button" type="button" onClick={clearSession}>
                Sign out
              </button>
            ) : null}
          </div>

          {!user ? (
            <>
              <div className="segmented-control">
                <button type="button" className={authMode === 'login' ? 'is-active' : ''} onClick={() => setAuthMode('login')}>
                  Login
                </button>
                <button type="button" className={authMode === 'register' ? 'is-active' : ''} onClick={() => setAuthMode('register')}>
                  Register
                </button>
              </div>

              {authMode === 'login' ? (
                <form className="stack-form" onSubmit={handleLoginSubmit}>
                  <label>
                    Email
                    <input type="email" value={loginForm.email} onChange={(event) => setLoginForm((previous) => ({ ...previous, email: event.target.value }))} required />
                  </label>

                  <label>
                    Password
                    <input type="password" value={loginForm.password} onChange={(event) => setLoginForm((previous) => ({ ...previous, password: event.target.value }))} required />
                  </label>

                  <button className="primary-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </button>
                </form>
              ) : (
                <form className="stack-form" onSubmit={handleRegisterSubmit}>
                  <label>
                    Full name
                    <input type="text" value={registerForm.fullName} onChange={(event) => setRegisterForm((previous) => ({ ...previous, fullName: event.target.value }))} required />
                  </label>

                  <label>
                    Email
                    <input type="email" value={registerForm.email} onChange={(event) => setRegisterForm((previous) => ({ ...previous, email: event.target.value }))} required />
                  </label>

                  <label>
                    Password
                    <input type="password" value={registerForm.password} onChange={(event) => setRegisterForm((previous) => ({ ...previous, password: event.target.value }))} required minLength={8} />
                  </label>

                  <button className="primary-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="session-card">
              <div>
                <span className="session-label">User</span>
                <strong>{user.fullName}</strong>
                <p>{user.email}</p>
              </div>

              <div>
                <span className="session-label">Session expiry</span>
                <strong>{formatDateTime(expiresAtUtc)}</strong>
              </div>

              <div className="session-note">
                Use Swagger or this web app to exercise the protected endpoints with the same JWT session.
              </div>
            </div>
          )}
        </section>

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
            <button className={activeSection === 'overview' ? 'is-active' : ''} onClick={() => changeSection('overview')}>Overview</button>
            <button className={activeSection === 'categories' ? 'is-active' : ''} onClick={() => changeSection('categories')}>Categories</button>
            <button className={activeSection === 'products' ? 'is-active' : ''} onClick={() => changeSection('products')}>Products</button>
            <button className={activeSection === 'movements' ? 'is-active' : ''} onClick={() => changeSection('movements')}>Movements</button>
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

                <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} disabled={products.length === 0}>
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
          ) : null}

          {token && !isBootstrapping && activeSection === 'categories' ? (
            <section className="section-grid section-grid--split">
              <article className="surface nested-surface">
                <div className="panel-header">
                  <div><span className="panel-kicker">{editingCategoryId ? 'Maintain' : 'Create'}</span><h3>{editingCategoryId ? 'Edit category' : 'New category'}</h3></div>
                  {editingCategoryId ? <button className="ghost-button" type="button" onClick={resetCategoryForm}>Cancel</button> : null}
                </div>
                <form className="stack-form" onSubmit={handleSaveCategory}>
                  <label>Name<input type="text" value={categoryForm.name} onChange={(event) => setCategoryForm((previous) => ({ ...previous, name: event.target.value }))} required /></label>
                  <label>Description<textarea rows={4} value={categoryForm.description} onChange={(event) => setCategoryForm((previous) => ({ ...previous, description: event.target.value }))} /></label>
                  <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editingCategoryId ? 'Update category' : 'Save category'}</button>
                </form>
              </article>

              <article className="surface nested-surface">
                <div className="panel-header"><div><span className="panel-kicker">Browse</span><h3>Category catalog</h3></div></div>
                <input className="search-input" type="search" placeholder="Search categories" value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} />
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
                        <button className="ghost-button" type="button" onClick={() => startCategoryEdit(category)}>Edit</button>
                        <button className="danger-button" type="button" onClick={() => void handleDeleteCategory(category)} disabled={isSubmitting}>Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            </section>
          ) : null}

          {token && !isBootstrapping && activeSection === 'products' ? (
            <section className="section-grid section-grid--split">
              <article className="surface nested-surface">
                <div className="panel-header">
                  <div><span className="panel-kicker">{editingProductId ? 'Maintain' : 'Create'}</span><h3>{editingProductId ? 'Edit product' : 'New product'}</h3></div>
                  {editingProductId ? <button className="ghost-button" type="button" onClick={resetProductForm}>Cancel</button> : null}
                </div>
                <form className="stack-form" onSubmit={handleSaveProduct}>
                  <label>
                    Category
                    <select value={productForm.categoryId} onChange={(event) => setProductForm((previous) => ({ ...previous, categoryId: event.target.value }))} required>
                      {categories.length === 0 ? <option value="">Create a category first</option> : null}
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </label>
                  <label>Product name<input type="text" value={productForm.name} onChange={(event) => setProductForm((previous) => ({ ...previous, name: event.target.value }))} required /></label>
                  <div className="two-column">
                    <label>SKU<input type="text" value={productForm.sku} onChange={(event) => setProductForm((previous) => ({ ...previous, sku: event.target.value }))} required /></label>
                    <label>Unit price<input type="number" min="0" step="0.01" value={productForm.unitPrice} onChange={(event) => setProductForm((previous) => ({ ...previous, unitPrice: event.target.value }))} required /></label>
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
                <input className="search-input" type="search" placeholder="Search by name or SKU" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} />
                <div className="list-shell">
                  {categories.length === 0 ? (
                    <div className="empty-state compact">
                      <strong>Products depend on categories.</strong>
                      <p>Set up your inventory taxonomy first to keep product data clean.</p>
                      <button className="ghost-button" type="button" onClick={() => changeSection('categories')}>Go to categories</button>
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
                        <p>{getCategoryName(product.categoryId)}</p>
                      </div>
                      <div className="inline-actions">
                        <span className={`tag ${product.isActive ? 'tag--success' : 'tag--muted'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
                        <button className="ghost-button" type="button" onClick={() => void handleToggleProductStatus(product)} disabled={isSubmitting}>
                          {product.isActive ? 'Inactivate' : 'Activate'}
                        </button>
                        <button className="ghost-button" type="button" onClick={() => startProductEdit(product)}>Edit</button>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            </section>
          ) : null}

          {token && !isBootstrapping && activeSection === 'movements' ? (
            <section className="section-grid section-grid--split">
              <article className="surface nested-surface">
                <div className="panel-header"><div><span className="panel-kicker">Register</span><h3>Stock movement</h3></div></div>
                <form className="stack-form" onSubmit={handleCreateMovement}>
                  <label>
                    Product
                    <select value={movementForm.productId} onChange={(event) => setMovementForm((previous) => ({ ...previous, productId: event.target.value }))} required>
                      {activeProducts.length === 0 ? <option value="">Activate a product first</option> : null}
                      {activeProducts.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
                    </select>
                  </label>
                  <div className="two-column">
                    <label>
                      Movement type
                      <select value={movementForm.type} onChange={(event) => setMovementForm((previous) => ({ ...previous, type: event.target.value }))}>
                        <option value="1">Entry</option>
                        <option value="2">Exit</option>
                      </select>
                    </label>
                    <label>Quantity<input type="number" min="1" step="1" value={movementForm.quantity} onChange={(event) => setMovementForm((previous) => ({ ...previous, quantity: event.target.value }))} required /></label>
                  </div>
                  <label>Reason<textarea rows={4} value={movementForm.reason} onChange={(event) => setMovementForm((previous) => ({ ...previous, reason: event.target.value }))} /></label>
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
                  <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
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
                      <button className="ghost-button" type="button" onClick={() => changeSection('products')}>Go to products</button>
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
          ) : null}
        </section>
      </main>
    </div>
  )
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers()
  headers.set('Accept', 'application/json')

  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`)

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const payload = (await safeParseJson(response)) as { detail?: string; title?: string } | null
    throw new ApiError(response.status, payload?.detail ?? payload?.title ?? `Request failed with status ${response.status}.`)
  }

  if (response.status === 204) return undefined as T
  return (await safeParseJson(response)) as T
}

async function safeParseJson(response: Response) {
  const raw = await response.text()
  return raw ? (JSON.parse(raw) as unknown) : null
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unexpected error.'
}

class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function formatDateTime(value: string) {
  if (!value) return 'Not available'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default App
