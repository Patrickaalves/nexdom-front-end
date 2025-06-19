<template>
  <PageCard>
    <v-container fluid>
      <h1>Movimento De Estoque</h1>

      <v-btn @click="showDialog = true" color="green-darken-1">Novo Movimento de estoque</v-btn>

      <v-data-table
        :items="stockMovements"
        :headers="headers"
        fixed-header
        height="500px"
        class="mt-2"
        style="max-width: 90%;"
      >
        <template #item.saleDate="{ item }">
          {{ formatDate(item.saleDate) }}
        </template>

        <template #item.customerId="{ item }">
          {{ customerById[item.customerId] }}
        </template>

        <template #item.operationType="{ item }">
          {{ operationTypeLabels[item.operationType] }}
        </template>

        <template #item.action="{ index }">
          <v-btn icon small class="action-btn" color="red-darken-2" @click="deleteStockMovement(index)">
            <v-icon size="18">mdi-trash-can-outline</v-icon>
          </v-btn>
        </template>

        <template #header.action>
          <th style="width: 50px; font-weight: 100;">Ação</th>
        </template>
      </v-data-table>

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

      <!-- Formulário com validação -->
      <v-dialog v-model="showDialog" max-width="500">
        <v-card>
          <v-card-title>{{ 'Novo Movimento de estoque' }}</v-card-title>
          <v-card-text>
            <v-form ref="formRef" v-model="formValid" lazy-validation>
              <v-select
                v-model="form.operationType"
                :items="operationType"
                item-title="title"
                item-value="value"
                label="Tipo de Operação"
                :rules="[rules.required]"
                required
              />

              <v-select
                v-model="form.productId"
                :items="productOptions"
                item-title="title"
                item-value="value"
                label="Produto"
                :return-object="false"
                :loading="productStore.loading"
                :rules="[rules.required]"
                required
              />

              <v-select
                v-model="form.customerId"
                :items="customerOptions"
                item-title="title"
                item-value="value"
                label="Cliente"
                :return-object="false"
                :loading="customerStore.loading"
                :rules="[rules.required]"
                required
              />

              <v-text-field
                v-model.number="form.salePrice"
                label="Preço da venda"
                type="number"
                step="0.01"
                @blur="form.salePrice = truncate2(form.salePrice)"
                :rules="[rules.required, rules.positiveNumber]"
                required
              />

              <v-text-field
                v-model.number="form.movementQuantity"
                label="Quantidade Movimentada"
                type="number"
                :rules="[rules.required, rules.positiveInteger]"
                required
              />

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
import { useStockMovementStore, type StockMovement } from '../store/stockmovement'
import { useCustomerStore } from '../store/customer'
import { operationTypeLabels } from '../constants/operation-type'
import PageCard from '../components/PageCard.vue'
import { format } from 'date-fns'

const stockMovementStore = useStockMovementStore()
const customerStore = useCustomerStore()
const productStore = useProductStore()

const showDialog = ref(false)
const editIndex = ref(-1)
const showError = ref(false)
const saving = ref(false)
const formValid = ref(false)
const formRef = ref()

const headers = [
  { title: 'Código do Produto', key: 'productCode' },
  { title: 'Cliente', key: 'customerId' },
  { title: 'Qtd. movimentada', key: 'movementQuantity' },
  { title: 'Valor da venda', key: 'salePrice' },
  { title: 'Data da venda', key: 'saleDate' },
  { title: 'Tipo de operacao', key: 'operationType' },
  { title: 'Ação', key: 'action', sortable: false },
]

const stockMovements = computed(() => stockMovementStore.stockMovements)

const productOptions = computed(() =>
  productStore.products.map(p => ({
    title: `${p.code}`,
    value: p.productId,
  }))
)

const customerOptions = computed(() =>
  customerStore.customers.map(c => ({
    title: `${c.code} - ${c.name}`,
    value: c.customerId,
  }))
)

const operationType = computed(() =>
  Object.entries(operationTypeLabels).map(([value, title]) => ({ value, title }))
)

const customerById = computed(() =>
  Object.fromEntries(
    customerStore.customers.map(p => [p.customerId, p.code])
  )
)

const form = reactive<StockMovement>({
  stockMovementId: '',
  productId: '',
  operationType: undefined,
  salePrice: 0,
  saleDate: '',
  movementQuantity: 0,
  customerId: '',
  productCode: '',
})

function resetForm() {
  form.stockMovementId = undefined
  form.productId = ''
  form.operationType = undefined
  form.salePrice = 0
  form.saleDate = ''
  form.movementQuantity = 0
  form.customerId = ''
  form.productCode = ''
}

onMounted(() => {
  stockMovementStore.fetchStockMovements()
  if (customerStore.customers.length === 0) {
    customerStore.fetchCustomers()
  }
  if (productStore.products.length === 0) {
    productStore.fetchProducts()
  }
})

const rules = {
  required: (v: any) => !!v || 'Campo obrigatório',
  positiveNumber: (v: number) => (v > 0) || 'Deve ser maior que zero',
  positiveInteger: (v: number) => (Number.isInteger(v) && v > 0) || 'Deve ser um número inteiro positivo',
}

async function save() {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  saving.value = true

  const stockMovement = toRaw(form)

  if (form.saleDate) {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')

    form.saleDate = `${form.saleDate}T${hh}:${mm}:00`
  }

  await stockMovementStore.addStockMovement(stockMovement)

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

function truncate2(value: number): number {
  return Math.trunc(value * 100) / 100
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return format(date, 'dd/MM/yyyy HH:mm')
}

watch(() => stockMovementStore.error, (newVal) => {
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