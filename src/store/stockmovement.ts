import { defineStore } from 'pinia'
import { api } from '../api/http'
import { OperationType} from '../constants/operation-type'

/* ---------- Tipos ---------- */
export interface StockMovement {
  stockMovementId: string
  productId: string
  operationType: OperationType
  salePrice: number
  saleDate: string
  movementQuantity: number
  customerId: string
  productCode: string
}

/* ---------- Store ---------- */
export const useStockMovementStore = defineStore('stock-movement', {
  state: () => ({
    stockMovements: [] as StockMovement[],

    loading: false,

    /* --- feedbacks --- */
    error: '' as string | null,

    successMessage: '' as string | null,
    successVisible: false,

    /* --- paginação --- */
    page: 0,
    totalPages: 0,
  }),

  actions: {
    /* Limpa todos os feedbacks antes de uma operação */
    clearMessages() {
      this.error = null
      this.successMessage = null
      this.successVisible = false
    },

    /* -------- CRUD -------- */
    async fetchStockMovements(page = 0, size = 10) {
      this.loading = true
      this.clearMessages()
      try {
        const { data } = await api.get('/stock-movement', { params: { page, size } })

        this.stockMovements = data.content.map((p: any) => ({
            stockMovementId: p.stockMovementId,
            productId: p.productId,
            operationType: p.operationType,
            salePrice: p.salePrice,
            saleDate: p.saleDate,
            movementQuantity: p.movementQuantity,
            customerId: p.customerId,
            productCode: p.productCode
        }))

        this.page = page
        this.totalPages = data.totalPages
      } catch {
        this.error = 'Erro ao carregar Movimento de estoques'
      } finally {
        this.loading = false
      }
    },

    async addStockMovement(stockMovement: StockMovement) {
      this.clearMessages()
      try {
        const { data } = await api.post('/stock-movement', stockMovement)

        this.stockMovements.push({
          stockMovementId: data.stockMovementId,
            productId: data.productId,
            operationType: data.operationType,
            salePrice: data.salePrice,
            saleDate: data.saleDate,
            movementQuantity: data.movementQuantity,
            customerId: data.customerId,
            productCode: data.productCode
        })

        this.successMessage = 'Movimento de estoque cadastrado com sucesso!'
        this.successVisible = true
      } catch (error: any) {
        const data = error?.response?.data

        if (Array.isArray(data)) {
          this.error = data
            .map((e: any) => e.defaultMessage || e.message || 'Erro desconhecido')
            .join('\n• ')
        } else if (data?.errorMessage) {
          this.error = 'Erro ao salvar Movimento de estoque: ' + data.errorMessage
        } else if (typeof data === 'string') {
          this.error = 'Erro ao salvar Movimento de estoque: ' + data
        } else {
          this.error = 'Erro ao salvar Movimento de estoque'
        }
      }
    },

    async deleteStockMovement(index: number) {
      this.clearMessages()
      const id = this.stockMovements[index].stockMovementId
      if (!id) return

      try {
        await api.delete(`/stock-movement/${id}`)
        this.stockMovements.splice(index, 1)

        this.successMessage = 'Movimento de estoque excluído com sucesso!'
        this.successVisible = true
      } catch (error: any) {
        if (error.response?.data?.errorMessage) {
          this.error = 'Erro ao deletar Movimento de estoque: ' + error.response.data.errorMessage
        } else {
          this.error = 'Erro ao deletar Movimento de estoque'
        }
      }
    },
  },
})