// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import Produtos from '../pages/Products.vue'
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
    path: '/product-informations',
    name: 'product-informations',
    component: ProductInformations,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router