// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import Produtos from '../pages/Products.vue'
import StockMovements from '../pages/StockMovements.vue'
import ProductProfit from '../pages/ProductProfit.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'products' },      // <- usa “name” em vez de string de path
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