import { startTransition, useDeferredValue, useEffect, useState } from 'react'
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

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5174'

const emptyLogin = { email: '', password: '' }
const emptyRegister = { fullName: '', email: '', password: '' }
const emptyCategory = { name: '', description: '' }
const emptyProduct = { categoryId: '', name: '', sku: '', unitPrice: '0' }
const emptyMovement = { productId: '', type: '1', quantity: '1', reason: '' }

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

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
          setFeedback({ tone: 'error', message: getErrorMessage(error) })
          clearSession()
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
          setFeedback({ tone: 'error', message: getErrorMessage(error) })
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
      setFeedback({ tone: 'error', message: getErrorMessage(error) })
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
      setFeedback({ tone: 'error', message: getErrorMessage(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return

    setIsSubmitting(true)
    try {
      await apiRequest('/api/categories', {
        method: 'POST',
        token,
        body: categoryForm,
      })

      await reloadCategories()
      setCategoryForm(emptyCategory)
      setFeedback({ tone: 'success', message: 'Category created successfully.' })
    } catch (error) {
      setFeedback({ tone: 'error', message: getErrorMessage(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return

    setIsSubmitting(true)
    try {
      await apiRequest('/api/products', {
        method: 'POST',
        token,
        body: {
          categoryId: productForm.categoryId,
          name: productForm.name,
          sku: productForm.sku,
          unitPrice: Number(productForm.unitPrice),
        },
      })

      await reloadProducts()
      setProductForm({
        categoryId: categories[0]?.id ?? '',
        name: '',
        sku: '',
        unitPrice: '0',
      })
      setFeedback({ tone: 'success', message: 'Product created successfully.' })
    } catch (error) {
      setFeedback({ tone: 'error', message: getErrorMessage(error) })
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
      setFeedback({ tone: 'error', message: getErrorMessage(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  function changeSection(section: Section) {
    startTransition(() => {
      setActiveSection(section)
    })
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
                  <div><span>Tracked movements</span><strong>{movements.length}</strong></div>
                </div>
              </article>
            </section>
          ) : null}

          {token && !isBootstrapping && activeSection === 'categories' ? (
            <section className="section-grid section-grid--split">
              <article className="surface nested-surface">
                <div className="panel-header"><div><span className="panel-kicker">Create</span><h3>New category</h3></div></div>
                <form className="stack-form" onSubmit={handleCreateCategory}>
                  <label>Name<input type="text" value={categoryForm.name} onChange={(event) => setCategoryForm((previous) => ({ ...previous, name: event.target.value }))} required /></label>
                  <label>Description<textarea rows={4} value={categoryForm.description} onChange={(event) => setCategoryForm((previous) => ({ ...previous, description: event.target.value }))} /></label>
                  <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save category'}</button>
                </form>
              </article>

              <article className="surface nested-surface">
                <div className="panel-header"><div><span className="panel-kicker">Browse</span><h3>Category catalog</h3></div></div>
                <input className="search-input" type="search" placeholder="Search categories" value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} />
                <div className="list-shell">
                  {filteredCategories.length === 0 ? <div className="empty-state compact">No categories found for this filter.</div> : filteredCategories.map((category) => (
                    <article key={category.id} className="list-card">
                      <div><strong>{category.name}</strong><p>{category.description ?? 'No description yet.'}</p></div>
                    </article>
                  ))}
                </div>
              </article>
            </section>
          ) : null}

          {token && !isBootstrapping && activeSection === 'products' ? (
            <section className="section-grid section-grid--split">
              <article className="surface nested-surface">
                <div className="panel-header"><div><span className="panel-kicker">Create</span><h3>New product</h3></div></div>
                <form className="stack-form" onSubmit={handleCreateProduct}>
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
                  <button className="primary-button" type="submit" disabled={isSubmitting || categories.length === 0}>{isSubmitting ? 'Saving...' : 'Save product'}</button>
                </form>
              </article>

              <article className="surface nested-surface">
                <div className="panel-header"><div><span className="panel-kicker">Browse</span><h3>Product inventory</h3></div></div>
                <input className="search-input" type="search" placeholder="Search by name or SKU" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} />
                <div className="list-shell">
                  {filteredProducts.length === 0 ? <div className="empty-state compact">No products found for this filter.</div> : filteredProducts.map((product) => (
                    <article key={product.id} className="list-card">
                      <div><strong>{product.name}</strong><p>{product.sku} · {formatCurrency(product.unitPrice)}</p></div>
                      <span className={`tag ${product.isActive ? 'tag--success' : 'tag--muted'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
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
                      {products.length === 0 ? <option value="">Create a product first</option> : null}
                      {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>)}
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
                  <button className="primary-button" type="submit" disabled={isSubmitting || products.length === 0}>{isSubmitting ? 'Recording...' : 'Record movement'}</button>
                </form>
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
                  <div><span>Current balance</span><strong>{balance?.currentBalance ?? 0}</strong></div>
                  <div><span>History rows</span><strong>{movements.length}</strong></div>
                </div>
                <div className="list-shell">
                  {movements.length === 0 ? <div className="empty-state compact">No movement history for the selected product yet.</div> : movements.map((movement) => (
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
    throw new Error(payload?.detail ?? payload?.title ?? `Request failed with status ${response.status}.`)
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
