<!-- AppLayout.vue -->
<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>Controle de Estoque</v-toolbar-title>
    </v-app-bar>

    <!-- Drawer fixo que empurra o conteúdo -->
    <v-navigation-drawer
      app
      v-model="drawer"
      color="primary"
      width="300"
      elevation="1"
    >
      <v-list nav dense>
        <v-list-group prepend-icon="mdi-truck" value="true">
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="Fornecedores" />
          </template>

          <v-list-item link @click="goTo('supplier')">
            <v-list-item-title>Fornecedor</v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-list-group prepend-icon="mdi-account-tie" value="true">
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="Clientes" />
          </template>

          <v-list-item link @click="goTo('customer')">
            <v-list-item-title>Cliente</v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-list-group prepend-icon="mdi-package-variant" value="true">
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="Produtos" />
          </template>

          <v-list-item link @click="goTo('products')">
            <v-list-item-title>Produto</v-list-item-title>
          </v-list-item>

          <v-list-item link @click="goTo('product-profit')">
            <v-list-item-title>Lucro Por Produto</v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-list-group prepend-icon="mdi-swap-horizontal" value="false">
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="Movimentos de Estoque" />
          </template>

          <v-list-item link @click="goTo('stock-movements')">
            <v-list-item-title>Movimento De Estoque</v-list-item-title>
          </v-list-item>
        </v-list-group>

      </v-list>
    </v-navigation-drawer>

    <!-- Conteúdo principal -->
    <v-main class="bg-grey-lighten-3" style="background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const drawer = ref(true)
const router = useRouter()

function goTo(name: string) {
  router.push({ name })
}
</script>
