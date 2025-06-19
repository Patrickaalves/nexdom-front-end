import { defineStore } from 'pinia'
import { api } from '../api/http'

/*  Tipos  */
export interface ProductProfit {
  productId:         string
  productCode:       string
  totalQuantitySold: number
  totalProfit:       number
}

export interface ProductStock {
  productId:      string
  productCode:    string
  productType:    string
  quantityOut:    number
  stockQuantity:  number
}

/*  Store  */
export const useProductInformationStore = defineStore('productInformations', {
  state: () => ({
    productProfit: null as ProductProfit | null,
    productStock:  null as ProductStock  | null,
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

    /* -- Lucro -- */
    async fetchProductProfitByCode(productCode: string) {
      try {
        const { data } = await api.get(`/product/profit-product/${productCode}`)
        this.productProfit = {
          productId: data.productId,
          productCode: data.productCode,
          totalQuantitySold: data.totalQuantitySold,
          totalProfit: data.totalProfit,
        }
      } catch (e) {
        throw new Error('Erro ao buscar lucro do produto')
      }
    },

    /* -- Estoque / saída --- */
    async fetchProductStockByCode(productCode: string) {
      try {
        const { data } = await api.get(`/product/find-products-type/${productCode}`)
        this.productStock = data     // já tem exatamente os mesmos campos
      } catch (e) {
        throw new Error('Erro ao buscar estoque do produto')
      }
    },

    /* -- Função única para a página  */
    async fetchAllByCode(productCode: string) {
      if (!productCode) {
        this.error = 'Informe o código do produto'
        return
      }

      this.loading = true
      this.clearMessages()
      try {
        await Promise.all([
          this.fetchProductProfitByCode(productCode),
          this.fetchProductStockByCode(productCode),
        ])

        this.successMessage = 'Dados carregados com sucesso!'
        this.successVisible = true
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar dados'
      } finally {
        this.loading = false
      }
    },
  },
})
