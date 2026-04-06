import { useDeferredValue, useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { fetchProducts } from '../api/products'
import type { Category, Product } from '../types'

const emptyProduct = { categoryId: '', name: '', sku: '', unitPrice: '0' }

export function useProducts(
  token: string,
  categories: Category[],
  selectedProductId: string,
  setSelectedProductId: Dispatch<SetStateAction<string>>,
) {
  const [products, setProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [productForm, setProductForm] = useState(emptyProduct)
  const deferredProductSearch = useDeferredValue(productSearch)

  function applyDefaultCategory(categoryId: string) {
    setProductForm((previous) => ({ ...previous, categoryId }))
  }

  useEffect(() => {
    if (!productForm.categoryId && categories.length > 0) {
      const categoryId = categories[0].id
      queueMicrotask(() => {
        applyDefaultCategory(categoryId)
      })
    }
  }, [categories, productForm.categoryId])

  const filteredProducts = products.filter((product) => {
    const query = deferredProductSearch.trim().toLowerCase()
    if (!query) {
      return true
    }

    return `${product.name} ${product.sku}`.toLowerCase().includes(query)
  })

  const activeProducts = products.filter((product) => product.isActive)

  async function reloadProducts() {
    if (!token) return

    const loadedProducts = await fetchProducts(token)
    setProducts(loadedProducts)

    if (loadedProducts.length > 0 && !loadedProducts.some((product) => product.id === selectedProductId)) {
      setSelectedProductId(loadedProducts[0].id)
    }
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

  function getCategoryName(categoryId: string, sourceCategories: Category[]) {
    return sourceCategories.find((category) => category.id === categoryId)?.name ?? 'Unassigned category'
  }

  return {
    products,
    filteredProducts,
    activeProducts,
    productSearch,
    productForm,
    editingProductId,
    setProductSearch,
    setProductForm,
    setProducts,
    reloadProducts,
    startProductEdit,
    resetProductForm,
    getCategoryName,
  }
}
