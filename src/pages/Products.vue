<template>
  <PageCard>
    <v-container fluid>
      <h1>Produtos</h1>

      <v-btn @click="showDialog = true" color="green-darken-1">Novo Produto</v-btn>

      <v-row dense align="center" class="mt-4">
        <v-col cols="12" sm="4" md="3">
          <v-select
            v-model="searchField"
            :items="searchFieldItems"
            label="Filtrar por"
            hide-details
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" sm="8" md="3">
          <v-text-field
            v-model="searchQuery"
            label="Pesquisar"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            density="comfortable"
          />
        </v-col>
      </v-row>

      <v-data-table
        :items="filteredProducts"
        :headers="headers"
        fixed-header
        height="570"
        class="mt-2"
        style="max-width: 100%;"
      >
        <!-- Coluna Tipo -->
        <template #item.productType="{ item }">
          {{ productTypeLabels[item.productType] }}
        </template>

        <template #item.supplier="{ item }">
          {{ supplierById[item.supplier] }}
        </template>

        <!-- Coluna Preço Fornecedor -->
        <template #item.supplierPrice="{ item }">
          {{ truncate2(item.supplierPrice).toFixed(2).replace('.', ',') }}
        </template>

        <!-- Coluna Ações -->
        <template #item.action="{ index }">
          <v-btn icon small class="action-btn" color="blue-darken-2" @click="editProduct(index)">
            <v-icon size="18">mdi-pencil-outline</v-icon>
          </v-btn>
          <v-btn icon small class="action-btn" color="red-darken-2" @click="deleteProduct(index)">
            <v-icon size="18">mdi-trash-can-outline</v-icon>
          </v-btn>
        </template>

        <!-- Header Ação -->
        <template #header.action>
          <th style="width: 100px; text-align: center; font-weight: 100;">Ação</th>
        </template>
      </v-data-table>

      <!-- Snackbar de sucesso -->
      <v-snackbar
        v-model="productStore.successVisible"
        :timeout="3000"
        color="success"
        location="top right"
        @update:model-value="val => { if (!val) productStore.successVisible = false }"
      >
        <span class="text-center w-100">{{ productStore.successMessage }}</span>
      </v-snackbar>

      <!-- Snackbar de erro -->
      <v-snackbar
        v-model="showError"
        :timeout="5000"
        color="error"
        top
        @update:model-value="val => { if (!val) productStore.error = null }"
      >
        <span class="text-center w-100">{{ productStore.error }}</span>
      </v-snackbar>

      <!-- Formulário -->
      <v-dialog v-model="showDialog" max-width="500">
        <v-card>
          <v-card-title>{{ isEditing ? 'Editar Produto' : 'Novo Produto' }}</v-card-title>
          <v-card-text>
            <v-text-field v-model="form.code" label="Código" />

            <v-select
              v-model="form.productType"
              :items="typeItems"
              item-title="title"
              item-value="value"
              label="Tipo Produto"
              :rules="[v => !!v || 'Tipo é obrigatório']"
            />

            <v-select
              v-model="form.supplier"
              :items="supplierOptions"
              item-title="title"
              item-value="value"
              label="Fornecedor"
              :disabled="isEditing"
              :return-object="false"
              :loading="supplierStore.loading"
            />

            <v-text-field
              v-model.number="form.supplierPrice"
              label="Valor Fornecedor"
              type="number"
              step="0.01"
              @blur="form.supplierPrice = truncate2(form.supplierPrice)"
            />
            <v-text-field
              v-model.number="form.stockQuantity"
              label="Quantidade Estoque"
              type="number"
            />
          </v-card-text>

          <v-card-actions>
            <v-btn text @click="cancel">Cancelar</v-btn>
            <v-btn color="primary" :loading="saving" @click="save">Salvar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </PageCard>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, toRaw, watch } from 'vue'
import { productTypeLabels } from '../constants/product-types'
import { useProductStore, type Product } from '../store/product'
import { useSupplierStore } from '../store/supplier'
import PageCard from '../components/PageCard.vue'

/*  Store  */
const productStore = useProductStore()
const supplierStore = useSupplierStore()

/*  Estado local  */
const showDialog = ref(false)
const isEditing  = ref(false)
const editIndex  = ref(-1)

const showError  = ref(false)
const saving     = ref(false)

/*  Filtro de pesquisa  */
const searchField = ref<'code' | 'productType' | 'supplier' | 'supplierPrice' | 'stockQuantity'>('code')
const searchQuery = ref('')

const searchFieldItems = [
  { value: 'code',          title: 'Código' },
  { value: 'productType',   title: 'Tipo' },
  { value: 'supplier',      title: 'Fornecedor' },
  { value: 'supplierPrice', title: 'Preço Fornecedor' },
  { value: 'stockQuantity', title: 'Qtd. Estoque' },
]

/*  Produtos filtrados  */
const filteredProducts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return productStore.products

  return productStore.products.filter(p => {
    switch (searchField.value) {
      case 'code':
        return p.code?.toLowerCase().includes(q)

      case 'productType':
        return productTypeLabels[p.productType]
          ?.toLowerCase()
          .includes(q)

      case 'supplier':
        return supplierById.value[p.supplier]
          ?.toLowerCase()
          .includes(q)

      case 'supplierPrice':
        return String(p.supplierPrice).includes(q)

      case 'stockQuantity':
        return String(p.stockQuantity).includes(q)

      default:
        return true
    }
  })
})

/*  Cabeçalhos  */
const headers = [
  { title: 'Código',           key: 'code' },
  { title: 'Tipo',             key: 'productType' },
  { title: 'Preço Fornecedor', key: 'supplierPrice' },
  { title: 'Fornecedor',       key: 'supplier' },
  { title: 'Qtd. Estoque',     key: 'stockQuantity' },
  { title: 'Ação',             key: 'action', sortable: false },
]

/*  Computeds  */
const products = computed(() => productStore.products)

const typeItems = computed(() =>
  Object.entries(productTypeLabels).map(([value, title]) => ({ value, title })),
)

const supplierOptions = computed(() =>
  supplierStore.suppliers.map(s => ({
    title: `${s.code} - ${s.name}`,   
    value: s.supplierId
  }))
)

const supplierById = computed(() =>
  Object.fromEntries(
    supplierStore.suppliers.map(s => [s.supplierId, s.name])
  )
)

/*  Formulário  */
const form = reactive<Product>({
  productId: undefined,
  code: '',
  productType: 'ELETRONIC',
  supplier: undefined,
  supplierPrice: 0,
  stockQuantity: 0,
})

function resetForm() {
  form.productId     = undefined
  form.code          = ''
  form.productType   = 'ELETRONIC'
  form.supplier    = undefined
  form.supplierPrice = 0
  form.stockQuantity = 0
}

/*  Lifecycle  */
onMounted(() => {
  productStore.fetchProducts()
  if (supplierStore.suppliers.length === 0) {
    supplierStore.fetchSuppliers()
  }
})

/*  Ações UI  */
async function save() {
  saving.value = true

  form.supplierPrice = truncate2(form.supplierPrice)     // ★ garante no payload
  const product = toRaw(form)

  if (isEditing.value) {
    await productStore.updateProduct(editIndex.value, product)
  } else {
    await productStore.addProduct(product)
  }

  saving.value = false

  if (!productStore.error) {
    showDialog.value = false
    resetForm()
    isEditing.value  = false
  }
}

function editProduct(index: number) {
  const p = productStore.products[index]

  form.productId     = p.productId
  form.code          = p.code
  form.productType   = p.productType
  form.supplier      = p.supplier
  form.supplierPrice = p.supplierPrice
  form.stockQuantity = p.stockQuantity

  editIndex.value = index
  isEditing.value = true
  showDialog.value = true
}

async function deleteProduct(index: number) {
  await productStore.deleteProduct(index)
}

function cancel() {
  showDialog.value = false
  resetForm()
  isEditing.value = false
}

function truncate2(value: number): number {
  return Math.trunc(value * 100) / 100
}

/*  Watchers  */
watch(() => productStore.error, (newVal) => {
  if (newVal) showError.value = true
})
</script>

<style scoped>
.v-data-table__wrapper table th:nth-child(5),
.v-data-table__wrapper table td:nth-child(5) {
  width: 100px !important;
  text-align: center !important;
  padding: 0 8px !important;
  vertical-align: middle !important;
}

.action-btn {
  padding: 0px !important;
  margin: 8px 2px;
}
</style>