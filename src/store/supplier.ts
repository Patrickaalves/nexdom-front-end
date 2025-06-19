import { defineStore } from 'pinia'
import { api } from '../api/http'

export interface Supplier {
    supplierId: string
    code: string
    name: string,
    cnpj: string,
    phone?: string
}

export const useSupplierStore = defineStore('supplier', {
    state: () => ({
        suppliers: [] as Supplier[],
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
        clearMessages() {
            this.error = null
            this.successMessage = null
            this.successVisible = false
        },
        
        async fetchSuppliers(page = 0, size = 10) {
            this.loading = true
            this.clearMessages()
            try {
                const { data } = await api.get('/supplier', { params: { page, size } })
                this.suppliers = data.content.map((p: any) => ({
                    supplierId: p.supplierId,
                    code: p.code,
                    name: p.name,
                    cnpj: p.cnpj,
                    phone: p.phone
                }))

                this.page = page
                this.totalPages = data.totalPages
            } catch (error: any) {
                const data = error?.response?.data
                if (Array.isArray(data)) {
                    this.error = data
                        .map((e: any) => e.defaultMessage || e.message || 'Erro desconhecido')
                        .join('\n• ')
                } else if (data?.errorMessage) {
                    this.error = 'Erro ao buscar fornecedores: ' + data.errorMessage
                } else if (typeof data === 'string') {
                    this.error = 'Erro ao buscar fornecedores: ' + data
                } else {
                    this.error = 'Erro ao buscar fornecedores'
                }
            } finally {
                this.loading = false
            }
        },

        async addSupplier(supplier: Supplier) {
            this.clearMessages()
            try {
                const { data } = await api.post('/supplier', supplier)

                this.suppliers.push({
                    supplierId: data.supplierId,
                    code: data.code,
                    name: data.name,
                    cnpj: data.cnpj,
                    phone: data.phone,
                })

                this.successMessage = 'Fornecedor cadastrado com sucesso!'
                this.successVisible = true
            } catch (error: any) {
                const data = error?.response?.data
                if (Array.isArray(data)) {
                    this.error = data
                        .map((e: any) => e.defaultMessage || e.message || 'Erro desconhecido')
                        .join('\n• ')
                } else if (data?.errorMessage) {
                    this.error = 'Erro ao salvar Fornecedor: ' + data.errorMessage
                } else if (data?.defaultMessage) {
                    this.error = 'Erro ao salvar Fornecedor: ' + data.defaultMessage
                } else if (typeof data === 'string') {
                    this.error = 'Erro ao salvar Fornecedor: ' + data
                } else {
                    this.error = 'Erro ao salvar Fornecedor'
                }
            }
        },

        async updateSupplier(index: number, supplier: Supplier) {
            this.clearMessages()
            try {
                const { data } = await api.put(`/supplier/${supplier.supplierId}`, supplier)

                this.suppliers[index] = {
                    supplierId: data.supplierId,
                    code: data.code,
                    name: data.name,
                    cnpj: data.cnpj,
                    phone: data.phone,
                }

                this.successMessage = 'Produto atualizado com sucesso!'
                this.successVisible = true
            } catch (error: any) {
                const data = error?.response?.data
                if (Array.isArray(data)) {
                    this.error = data
                        .map((e: any) => e.defaultMessage || e.message || 'Erro desconhecido')
                        .join('\n• ')
                } else if (data?.errorMessage) {
                    this.error = 'Erro ao Atualizar Fornecedor: ' + data.errorMessage
                } else if (data?.defaultMessage) {
                    this.error = 'Erro ao Atualizar Fornecedor: ' + data.defaultMessage
                } else if (typeof data === 'string') {
                    this.error = 'Erro ao Atualizar Fornecedor: ' + data
                } else {
                    this.error = 'Erro ao Atualizar Fornecedor'
                }
            }
        },

        async deleteSupplier(index: number) {
            this.clearMessages()

            const id = this.suppliers[index].supplierId
            
            try {
                await api.delete(`/supplier/${id}`)
                this.suppliers.splice(index, 1)

                this.successMessage = 'Fornecedor excluído com sucesso!'
                this.successVisible = true
            } catch (error: any) {
                const data = error?.response?.data
                if (Array.isArray(data)) {
                    this.error = data
                        .map((e: any) => e.defaultMessage || e.message || 'Erro desconhecido')
                        .join('\n• ')
                } else if (data?.errorMessage) {
                    this.error = 'Erro ao Excluir Fornecedor: ' + data.errorMessage
                } else if (data?.defaultMessage) {
                    this.error = 'Erro ao Excluir Fornecedor: ' + data.defaultMessage
                } else if (typeof data === 'string') {
                    this.error = 'Erro ao Excluir Fornecedor: ' + data
                } else {
                    this.error = 'Erro ao Excluir Fornecedor'
                }
            }
        },
    }
})