<template>
  <PageCard>
    <v-container fluid>
      <h1>Movimento De Estoque</h1>

      <v-btn color="green-darken-1" @click="showDialog = true">
        Novo Movimento de estoque
      </v-btn>

      <!-- Tabela ------------------------------------------------------- -->
      <v-data-table
        :items="stockMovements"
        :headers="headers"
        height="500px"
        fixed-header
        class="mt-2"
        style="max-width: 90%;"
      >
        <!-- Data formatada -->
        <template #item.saleDate="{ item }">
          {{ formatDate(item.saleDate) }}
        </template>

        <!-- Participante (cliente ou fornecedor) -->
        <template #item.participant="{ item }">
          {{
            item.operationType === 'ENTRY'
              ? supplierById[item.supplierId]
              : customerById[item.customerId]
          }}
        </template>

        <!-- Tipo (label amigável) -->
        <template #item.operationType="{ item }">
          {{ operationTypeLabels[item.operationType] }}
        </template>

        <!-- Ações -->
        <template #item.action="{ index }">
          <v-btn
            icon
            small
            class="action-btn"
            color="red-darken-2"
            @click="deleteStockMovement(index)"
          >
            <v-icon size="18">mdi-trash-can-outline</v-icon>
          </v-btn>
        </template>

        <!-- Cabeçalho da coluna de ação -->
        <template #header.action>
          <th style="width: 50px; font-weight: 100;">Ação</th>
        </template>
      </v-data-table>

      <!-- Snackbars ---------------------------------------------------- -->
      <v-snackbar
        v-model="stockMovementStore.successVisible"
        :timeout="3000"
        color="success"
        location="top right"
        @update:model-value="val => { if (!val) stockMovementStore.successVisible = false }"
      >
        <span class="text-center w-100">{{ stockMovementStore.successMessage }}</span>
      </v-snackbar>

      <v-snackbar
        v-model="showError"
        :timeout="5000"
        color="error"
        top
        @update:model-value="val => { if (!val) stockMovementStore.error = null }"
      >
        <span class="text-center w-100">{{ stockMovementStore.error }}</span>
      </v-snackbar>

      <!-- Diálogo / Formulário ---------------------------------------- -->
      <v-dialog v-model="showDialog" max-width="500">
        <v-card>
          <v-card-title>Novo Movimento de estoque</v-card-title>

          <v-card-text>
            <v-form ref="formRef" v-model="formValid" lazy-validation>
              <!-- Tipo de operação -->
              <v-select
                v-model="form.operationType"
                :items="operationTypeItems"
                item-title="title"
                item-value="value"
                label="Tipo de Operação"
                :rules="[rules.required]"
                required
                @update:model-value="onOperationTypeChange"
              />

              <!-- Produto -->
              <v-select
                v-model="form.productId"
                :items="productOptions"
                item-title="title"
                item-value="value"
                label="Produto"
                :loading="productStore.loading"
                :rules="[rules.required]"
                required
              />

              <!-- Cliente ou Fornecedor (condicional) -->
              <v-select
                v-if="isEntry"
                v-model="form.supplierId"
                :items="supplierOptions"
                item-title="title"
                item-value="value"
                label="Fornecedor"
                :loading="supplierStore.loading"
                :rules="[rules.required]"
                required
              />
              <v-select
                v-else
                v-model="form.customerId"
                :items="customerOptions"
                item-title="title"
                item-value="value"
                label="Cliente"
                :loading="customerStore.loading"
                :rules="[rules.required]"
                required
              />
              
              <v-text-field
                v-model.number="form.salePrice"
                label="Preço"
                type="number"
                step="0.01"
                @blur="form.salePrice = truncate2(form.salePrice)"
                :rules="[rules.required, rules.positiveNumber]"
                required
              />

              <!-- Quantidade -->
              <v-text-field
                v-model.number="form.movementQuantity"
                label="Quantidade Movimentada"
                type="number"
                :rules="[rules.required, rules.positiveInteger]"
                required
              />

              <!-- Data -->
              <v-text-field
                v-model="form.saleDate"
                label="Data de Venda"
                type="date"
                :rules="[rules.required]"
                required
              />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-btn text @click="cancel">Cancelar</v-btn>
            <v-btn
              color="primary"
              :loading="saving"
              :disabled="!formValid || saving"
              @click="save"
            >
              Salvar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </PageCard>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, toRaw, watch } from 'vue'
import { useProductStore } from '../store/product'
import { useSupplierStore } from '../store/supplier'
import { useStockMovementStore } from '../store/stockmovement'
import { useCustomerStore } from '../store/customer'
import { operationTypeLabels } from '../constants/operation-type'
import type { StockMovementCreate } from '../types/stock-movement'
import PageCard from '../components/PageCard.vue'
import { format } from 'date-fns'

const stockMovementStore = useStockMovementStore()
const customerStore = useCustomerStore()
const supplierStore = useSupplierStore()
const productStore = useProductStore()

const showDialog = ref(false)
const showError = ref(false)
const saving = ref(false)
const formValid = ref(false)
const formRef = ref()

const headers = [
  { title: 'Código do Produto', key: 'productCode' },
  { title: 'Participante', key: 'participant' },
  { title: 'Qtd. Movimentada', key: 'movementQuantity' },
  { title: 'Valor da venda', key: 'salePrice' },
  { title: 'Data da venda', key: 'saleDate' },
  { title: 'Tipo', key: 'operationType' },
  { title: 'Ação', key: 'action', sortable: false },
]

const stockMovements = computed(() => stockMovementStore.stockMovements)

const productOptions = computed(() =>
  productStore.products.map(p => ({ title: p.code, value: p.productId }))
)

const customerOptions = computed(() =>
  customerStore.customers.map(c => ({ title: `${c.code} - ${c.name}`, value: c.customerId }))
)

const supplierOptions = computed(() =>
  supplierStore.suppliers.map(s => ({ title: `${s.code} - ${s.name}`, value: s.supplierId }))
)

const operationTypeItems = computed(() =>
  Object.entries(operationTypeLabels).map(([value, title]) => ({ value, title }))
)

const customerById = computed(() =>
  Object.fromEntries(customerStore.customers.map(c => [c.customerId, c.name]))
)
const supplierById = computed(() =>
  Object.fromEntries(supplierStore.suppliers.map(s => [s.supplierId, s.name]))
)

const form = reactive<StockMovementCreate>({
  productId: '',
  operationType: undefined as any,
  salePrice: 0,
  saleDate: '',
  movementQuantity: 0,
  customerId: undefined,
  supplierId: undefined,
})

const isEntry = computed(() => form.operationType === 'ENTRY')

function onOperationTypeChange() {
  if (isEntry.value) {
    form.customerId = undefined
  } else {
    form.supplierId = undefined
  }
}

const rules = {
  required: (v: any) => !!v || 'Campo obrigatório',
  positiveNumber: (v: number) => v > 0 || 'Deve ser maior que zero',
  positiveInteger: (v: number) => Number.isInteger(v) && v > 0 || 'Deve ser um número inteiro positivo',
}

onMounted(() => {
  stockMovementStore.fetchStockMovements()
  if (!customerStore.customers.length) customerStore.fetchCustomers()
  if (!supplierStore.suppliers.length) supplierStore.fetchSuppliers()
  if (!productStore.products.length) productStore.fetchProducts()
})

async function save() {
  if (!(await formRef.value?.validate())) return
  saving.value = true

  if (/^\d{4}-\d{2}-\d{2}$/.test(form.saleDate)) {
    const now = new Date()
    const hh = now.getHours().toString().padStart(2, '0')
    const mm = now.getMinutes().toString().padStart(2, '0')
    form.saleDate = `${form.saleDate}T${hh}:${mm}:00`
  }

  await stockMovementStore.addStockMovement(toRaw(form))
  saving.value = false

  if (!stockMovementStore.error) {
    showDialog.value = false
    resetForm()
  }
}

async function deleteStockMovement(index: number) {
  await stockMovementStore.deleteStockMovement(index)
}

function cancel() {
  showDialog.value = false
  resetForm()
}

function resetForm() {
  Object.assign(form, {
    productId: '',
    operationType: undefined,
    salePrice: 0,
    saleDate: '',
    movementQuantity: 0,
    customerId: undefined,
    supplierId: undefined,
  })
}

function truncate2(value: number): number {
  return Math.trunc(value * 100) / 100
}

function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd/MM/yyyy HH:mm')
}

watch(() => stockMovementStore.error, val => {
  if (val) showError.value = true
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
  padding: 0 !important;
  margin: 8px 2px;
}
</style>
