import { defineStore } from 'pinia'
import { api } from '../api/http'
import type { ProductType } from '../constants/product-types'

/* ---------- Tipos ---------- */
export interface Product {
  productId?: string
  code: string
  productType: ProductType
  supplierPrice: number
  stockQuantity: number
}

/* ---------- Store ---------- */
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],

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
    async fetchProducts(page = 0, size = 10) {
      this.loading = true
      this.clearMessages()
      try {
        const { data } = await api.get('/product', { params: { page, size } })

        this.products = data.content.map((p: any) => ({
          productId:      p.productId,
          code:           p.code,
          productType:    p.productType,
          supplierPrice:  p.supplierPrice,
          stockQuantity:  p.stockQuantity,
        }))

        this.page       = page
        this.totalPages = data.totalPages
      } catch {
        this.error = 'Erro ao carregar produtos'
      } finally {
        this.loading = false
      }
    },

    async addProduct(product: Product) {
      this.clearMessages()
      try {
        const { data } = await api.post('/product', product)

        this.products.push({
          productId:      data.productId,
          code:           data.code,
          productType:    data.productType,
          supplierPrice:  data.supplierPrice,
          stockQuantity:  data.stockQuantity,
        })

        this.successMessage = 'Produto cadastrado com sucesso!'
        this.successVisible = true
      } catch (error: any) {
        const data = error?.response?.data

        if (Array.isArray(data)) {
          this.error = data
            .map((e: any) => e.defaultMessage || e.message || 'Erro desconhecido')
            .join('\n• ')
        } else if (data?.errorMessage) {
          this.error = 'Erro ao salvar produto: ' + data.errorMessage
        } else if (typeof data === 'string') {
          this.error = 'Erro ao salvar produto: ' + data
        } else {
          this.error = 'Erro ao salvar produto'
        }
      }
    },

    async updateProduct(index: number, product: Product) {
      this.clearMessages()

      if (!product.productId) {
        this.error = 'Produto sem ID não pode ser atualizado.'
        return
      }

      try {
        const { data } = await api.put(`/product/${product.productId}`, product)

        this.products[index] = {
          productId:      data.productId,
          code:           data.code,
          productType:    data.productType,
          supplierPrice:  data.supplierPrice,
          stockQuantity:  data.stockQuantity,
        }

        this.successMessage = 'Produto atualizado com sucesso!'
        this.successVisible = true
      } catch (error: any) {
        if (error.response?.data?.errorMessage) {
          this.error = 'Erro ao atualizar produto: ' + error.response.data.errorMessage
        } else {
          this.error = 'Erro ao atualizar produto'
        }
      }
    },

    async deleteProduct(index: number) {
      this.clearMessages()
      const id = this.products[index].productId
      if (!id) return

      try {
        await api.delete(`/product/${id}`)
        this.products.splice(index, 1)

        this.successMessage = 'Produto excluído com sucesso!'
        this.successVisible = true
      } catch (error: any) {
        if (error.response?.data?.errorMessage) {
          this.error = 'Erro ao deletar produto: ' + error.response.data.errorMessage
        } else {
          this.error = 'Erro ao deletar produto'
        }
      }
    },

    /* Helper */
    getProductsByType(type: Product['productType']) {
      return this.products.filter(p => p.productType === type)
    },
  },
})