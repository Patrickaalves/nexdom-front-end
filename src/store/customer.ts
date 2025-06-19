import { defineStore } from 'pinia'
import { api } from '../api/http'

export interface Customer {
    customerId: string
    code: string
    name: string,
    phone?: string
}

export const useCustomerStore = defineStore('customer', {
    state: () => ({
        customers: [] as Customer[],
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
        
        async fetchCustomers(page = 0, size = 10) {
            this.loading = true
            this.clearMessages()
            try {
                const { data } = await api.get('/customer', { params: { page, size } })
                this.customers = data.content.map((p: any) => ({
                    customerId: p.customerId,
                    code: p.code,
                    name: p.name,
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

        async addCustomer(customer: Customer) {
            this.clearMessages()
            try {
                const { data } = await api.post('/customer', customer)

                this.customers.push({
                    customerId: data.customerId,
                    code: data.code,
                    name: data.name,
                    phone: data.phone,
                })

                this.successMessage = 'Cliente cadastrado com sucesso!'
                this.successVisible = true
            } catch (error: any) {
                const data = error?.response?.data
                if (Array.isArray(data)) {
                    this.error = data
                        .map((e: any) => e.defaultMessage || e.message || 'Erro desconhecido')
                        .join('\n• ')
                } else if (data?.errorMessage) {
                    this.error = 'Erro ao salvar Cliente: ' + data.errorMessage
                } else if (data?.defaultMessage) {
                    this.error = 'Erro ao salvar Cliente: ' + data.defaultMessage
                } else if (typeof data === 'string') {
                    this.error = 'Erro ao salvar Cliente: ' + data
                } else {
                    this.error = 'Erro ao salvar Cliente'
                }
            }
        },

        async updateCustomer(index: number, customer: Customer) {
            this.clearMessages()
            try {
                const { data } = await api.put(`/customer/${customer.customerId}`, customer)

                this.customers[index] = {
                    customerId: data.customerId,
                    code: data.code,
                    name: data.name,
                    phone: data.phone,
                }

                this.successMessage = 'Cliente atualizado com sucesso!'
                this.successVisible = true
            } catch (error: any) {
                const data = error?.response?.data
                if (Array.isArray(data)) {
                    this.error = data
                        .map((e: any) => e.defaultMessage || e.message || 'Erro desconhecido')
                        .join('\n• ')
                } else if (data?.errorMessage) {
                    this.error = 'Erro ao Atualizar Cliente: ' + data.errorMessage
                } else if (data?.defaultMessage) {
                    this.error = 'Erro ao Atualizar Cliente: ' + data.defaultMessage
                } else if (typeof data === 'string') {
                    this.error = 'Erro ao Atualizar Cliente: ' + data
                } else {
                    this.error = 'Erro ao Atualizar Cliente'
                }
            }
        },

        async deleteCustomer(index: number) {
            this.clearMessages()

            const id = this.customers[index].customerId
            
            try {
                await api.delete(`/customer/${id}`)
                this.customers.splice(index, 1)

                this.successMessage = 'Cliente excluído com sucesso!'
                this.successVisible = true
            } catch (error: any) {
                const data = error?.response?.data
                if (Array.isArray(data)) {
                    this.error = data
                        .map((e: any) => e.defaultMessage || e.message || 'Erro desconhecido')
                        .join('\n• ')
                } else if (data?.errorMessage) {
                    this.error = 'Erro ao Excluir Cliente: ' + data.errorMessage
                } else if (data?.defaultMessage) {
                    this.error = 'Erro ao Excluir Cliente: ' + data.defaultMessage
                } else if (typeof data === 'string') {
                    this.error = 'Erro ao Excluir Cliente: ' + data
                } else {
                    this.error = 'Erro ao Excluir Cliente'
                }
            }
        },
    }
})