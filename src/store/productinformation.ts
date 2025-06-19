import { defineStore } from 'pinia'
import { api } from '../api/http'

export interface ProductProfit {
  productId:         string
  productCode:       string
  totalQuantitySold: number
  totalProfit:       number
}

export const useProductInformationStore = defineStore('productInformations', {
  state: () => ({
    productProfit: null as ProductProfit | null,
    loading: false,

    /* feedbacks */
    error: '' as string | null,
    successMessage: '' as string | null,
    successVisible: false,
  }),

  actions: {
    clearMessages() {
      this.error = null
      this.successMessage = null
      this.successVisible = false
    },

    /** Busca lucro de produto pelo CÓDIGO */
    async fetchProductProfitByCode(productCode: string) {
      if (!productCode) {
        this.error = 'Informe o código do produto'
        return
      }

      this.loading = true
      this.clearMessages()
      try {
        const { data } = await api.get(`product/profit-product/${productCode}`)
        this.productProfit = {
          productId: data.productId,
          productCode: data.productCode,
          totalQuantitySold: data.totalQuantitySold,
          totalProfit: data.totalProfit,
        }
        this.successMessage = 'Dados carregados com sucesso!'
        this.successVisible = true
      } catch (error: any) {
        const data = error?.response?.data
        if (Array.isArray(data)) {
          this.error = data
            .map((e: any) => e.defaultMessage || e.message || 'Erro desconhecido')
            .join('\n• ')
        } else if (data?.errorMessage) {
          this.error = 'Erro ao buscar lucro do produto: ' + data.errorMessage
        } else if (typeof data === 'string') {
          this.error = 'Erro ao buscar lucro do produto: ' + data
        } else {
          this.error = 'Erro ao buscar lucro do produto'
        }
      } finally {
        this.loading = false
      }
    },
  },
})
