import { defineStore } from 'pinia'
import { api } from '../api/http'
import type { StockMovement, StockMovementCreate } from '../types/stock-movement'

export const useStockMovementStore = defineStore('stock-movement', {
  state: () => ({
    stockMovements: [] as StockMovement[],
    loading: false,
    error: null as string | null,
    successMessage: null as string | null,
    successVisible: false,
    page: 0,
    totalPages: 0,
  }),

  actions: {
    clearMessages() {
      this.error = this.successMessage = null
      this.successVisible = false
    },

    async fetchStockMovements(page = 0, size = 10) {
      this.loading = true
      this.clearMessages()
      try {
        const { data } = await api.get('/stock-movement', { params: { page, size } })
        this.stockMovements = data.content as StockMovement[]
        this.page = page
        this.totalPages = data.totalPages
      } catch {
        this.error = 'Erro ao carregar movimentos de estoque'
      } finally {
        this.loading = false
      }
    },

    async addStockMovement(payload: StockMovementCreate) {
      this.clearMessages()

      const cleanPayload = JSON.parse(JSON.stringify(payload)) // remove undefined

      try {
        const { data } = await api.post<StockMovement>('/stock-movement', cleanPayload)
        this.stockMovements.push(data)
        this.successMessage = 'Movimento de estoque cadastrado com sucesso!'
        this.successVisible = true
      } catch (error: any) {
        const resp = error?.response?.data
        this.error =
          Array.isArray(resp)
            ? resp.map((e: any) => e.defaultMessage || e.message).join('\n• ')
            : resp?.errorMessage
              ? `Erro ao salvar movimento de estoque: ${resp.errorMessage}`
              : 'Erro ao salvar movimento de estoque'
      }
    },

    async deleteStockMovement(index: number) {
      this.clearMessages()
      const id = this.stockMovements[index]?.stockMovementId
      if (!id) return

      try {
        await api.delete(`/stock-movement/${id}`)
        this.stockMovements.splice(index, 1)
        this.successMessage = 'Movimento de estoque excluído com sucesso!'
        this.successVisible = true
      } catch (e: any) {
        this.error = `Erro ao deletar movimento de estoque: ${e?.response?.data?.errorMessage ?? ''}`
      }
    },
  },
})