// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import Produtos from '../pages/Products.vue'
import StockMovements from '../pages/StockMovements.vue'
import ProductProfit from '../pages/ProductProfit.vue'
import Supplier from '../pages/Supplier.vue'
import Customer from '../pages/Customer.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'products' },      // <- usa “name” em vez de string de path
  },
  {
    path: '/supplier',
    name: 'supplier',
    component: Supplier,
  },
  {
    path: '/customer',
    name: 'customer',
    component: Customer,
  },
  {
    path: '/products',
    name: 'products',
    component: Produtos,
  },
  {
    path: '/stock-movements',
    name: 'stock-movements',
    component: StockMovements,
  },

    {
    path: '/product-profit',
    name: 'product-profit',
    component: ProductProfit,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router