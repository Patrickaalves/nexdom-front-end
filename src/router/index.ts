// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import Product from '../pages/Products.vue'
import StockMovements from '../pages/StockMovements.vue'
import ProductInformations from '../pages/ProductInformations.vue'
import Supplier from '../pages/Supplier.vue'
import Customer from '../pages/Customer.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'products' },
  },
  {
    path: '/supplier',
    name: 'supplier',
    component: Supplier,
    meta: {
      breadcrumb: ['Fornecedores', 'Fornecedor']
    }
  },
  {
    path: '/customer',
    name: 'customer',
    component: Customer,
    meta: {
      breadcrumb: ['Clientes', 'Cliente']
    }
  },
  {
    path: '/products',
    name: 'products',
    component: Product,
    meta: {
      breadcrumb: ['Produtos', 'Produto']
    }
  },
  {
    path: '/product-informations',
    name: 'product-informations',
    component: ProductInformations,
    meta: {
      breadcrumb: ['Produtos', 'Informações do Produto']
    }
  },
  {
    path: '/stock-movements',
    name: 'stock-movements',
    component: StockMovements,
    meta: {
      breadcrumb: ['Movimentos de Estoque', 'Movimento De Estoque']
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router