import { useEffect, useEffectEvent, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { fetchBalance, fetchMovementsByProduct } from '../api/stockMovements'
import type { Product, StockBalance, StockMovement } from '../types'

const emptyMovement = { productId: '', type: '1', quantity: '1', reason: '' }

export function useStockMovements(
  token: string,
  products: Product[],
  onError: (error: unknown, clearSession: boolean) => void,
) {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [balance, setBalance] = useState<StockBalance | null>(null)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [movementForm, setMovementForm] = useState(emptyMovement)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const handleErrorEvent = useEffectEvent((error: unknown, clearSession: boolean) => {
    onError(error, clearSession)
  })

  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id)
      setMovementForm((previous) => ({ ...previous, productId: products[0].id }))
    }
  }, [products, selectedProductId])

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
          fetchMovementsByProduct(token, selectedProductId),
          fetchBalance(token, selectedProductId),
        ])

        if (cancelled) {
          return
        }

        setMovements(loadedMovements)
        setBalance(loadedBalance)
      } catch (error) {
        if (!cancelled) {
          handleErrorEvent(error, false)
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

  const stockEntries = movements.filter((movement) => movement.type === 1).reduce((total, movement) => total + movement.quantity, 0)
  const stockExits = movements.filter((movement) => movement.type === 2).reduce((total, movement) => total + movement.quantity, 0)

  return {
    movements,
    balance,
    selectedProductId,
    movementForm,
    isLoadingInsights,
    stockEntries,
    stockExits,
    setSelectedProductId: setSelectedProductId as Dispatch<SetStateAction<string>>,
    setMovementForm,
  }
}
