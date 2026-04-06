import { useDeferredValue, useState } from 'react'
import { fetchCategories } from '../api/categories'
import type { Category } from '../types'

const emptyCategory = { name: '', description: '' }

export function useCategories(token: string) {
  const [categories, setCategories] = useState<Category[]>([])
  const [categorySearch, setCategorySearch] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryForm, setCategoryForm] = useState(emptyCategory)
  const deferredCategorySearch = useDeferredValue(categorySearch)

  const filteredCategories = categories.filter((category) => {
    const query = deferredCategorySearch.trim().toLowerCase()
    if (!query) {
      return true
    }

    return `${category.name} ${category.description ?? ''}`.toLowerCase().includes(query)
  })

  async function reloadCategories() {
    if (!token) return
    setCategories(await fetchCategories(token))
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

  return {
    categories,
    filteredCategories,
    categorySearch,
    categoryForm,
    editingCategoryId,
    setCategorySearch,
    setCategoryForm,
    setCategories,
    reloadCategories,
    startCategoryEdit,
    resetCategoryForm,
  }
}
