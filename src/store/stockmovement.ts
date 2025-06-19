import { defineStore } from 'pinia'
import { api } from '../api/http'

/* ---------- Tipos ---------- */
export interface StockMovement {
  stockMovementId: string
  code: string
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
          code: p.code
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
          code: data.code,
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

    async updateStockMovement(index: number, stockMovement: StockMovement) {
      this.clearMessages();

      try {
        const { data } = await api.put(`/stock-movement/${stockMovement.stockMovementId}`, stockMovement)

        this.stockMovements[index] = {
          stockMovementId: data.stockMovementId,
          code: data.code,
        //   stock-movementType: data.stock-movementType,
        //   supplier: data.supplier,
        //   supplierPrice: data.supplierPrice,
        //   stockQuantity: data.stockQuantity,
        }

        this.successMessage = 'Movimento de estoque atualizado com sucesso!'
        this.successVisible = true
      } catch (error: any) {
        if (error.response?.data?.errorMessage) {
          this.error = 'Erro ao atualizar Movimento de estoque: ' + error.response.data.errorMessage
        } else {
          this.error = 'Erro ao atualizar Movimento de estoque'
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