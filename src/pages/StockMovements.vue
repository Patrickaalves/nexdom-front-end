<template>
  <PageCard>
    <v-container fluid>
      <h1>Movimento De Estoque</h1>

      <v-btn @click="showDialog = true" color="green-darken-1">Novo Movimento de estoque</v-btn>

      <v-data-table
        :items="stockMovements"
        :headers="headers"
        fixed-header
        height="570"
        class="mt-2"
        style="max-width: 100%;"
      >
        <!-- Coluna Tipo -->
        <!-- <template #item.stockMovementType="{ item }">
          {{ stockMovementTypeLabels[item.stockMovementType] }}
        </template> -->

        <!-- <template #item.supplier="{ item }">
          {{ supplierById[item.supplier] ?? '—' }}
        </template> -->

        <!-- Coluna Preço Fornecedor -->
        <!-- <template #item.supplierPrice="{ item }">
          {{ truncate2(item.supplierPrice).toFixed(2).replace('.', ',') }}
        </template> -->

        <!-- Coluna Ações -->
        <template #item.action="{ index }">
          <v-btn icon small class="action-btn" color="blue-darken-2" @click="editStockMovement(index)">
            <v-icon size="18">mdi-pencil-outline</v-icon>
          </v-btn>
          <v-btn icon small class="action-btn" color="red-darken-2" @click="deleteStockMovement(index)">
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
        v-model="stockMovementStore.successVisible"
        :timeout="3000"
        color="success"
        location="top right"
        @update:model-value="val => { if (!val) stockMovementStore.successVisible = false }"
      >
        <span class="text-center w-100">{{ stockMovementStore.successMessage }}</span>
      </v-snackbar>

      <!-- Snackbar de erro -->
      <v-snackbar
        v-model="showError"
        :timeout="5000"
        color="error"
        top
        @update:model-value="val => { if (!val) stockMovementStore.error = null }"
      >
        <span class="text-center w-100">{{ stockMovementStore.error }}</span>
      </v-snackbar>

      <!-- Formulário -->
      <v-dialog v-model="showDialog" max-width="500">
        <v-card>
          <v-card-title>{{ isEditing ? 'Editar Movimento de estoque' : 'Novo Movimento de estoque' }}</v-card-title>
          <v-card-text>
            <v-text-field v-model="form.code" label="Código" />

            <!-- <v-select
              v-model="form.stockMovementType"
              :items="typeItems"
              item-title="title"
              item-value="value"
              label="Tipo Produto"
              :rules="[v => !!v || 'Tipo é obrigatório']"
            /> -->

            <!-- <v-select
              v-model="form.supplier"
              :items="supplierOptions"
              item-title="title"
              item-value="value"
              label="Fornecedor"
              :disabled="isEditing"
              :return-object="false"
              :loading="customerStore.loading"
            /> -->

            <!-- <v-text-field
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
            /> -->
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
import { useProductStore} from '../store/product'
import { useStockMovementStore, type StockMovement } from '../store/stockmovement'
import { useCustomerStore } from '../store/customer'
import PageCard from '../components/PageCard.vue'

/* ---------- Store ---------- */
const stockMovementStore = useStockMovementStore()
const customerStore = useCustomerStore()
const productStore = useProductStore()

/* ---------- Estado local ---------- */
const showDialog = ref(false)
const isEditing  = ref(false)
const editIndex  = ref(-1)

const showError  = ref(false)
const saving     = ref(false)

/* ---------- Cabeçalhos ---------- */
const headers = [
  { title: 'Código',           key: 'code' },
  { title: 'Tipo',             key: 'stockMovementType' },
  { title: 'Preço Fornecedor', key: 'supplierPrice' },
  { title: 'Fornecedor',       key: 'supplier' },
  { title: 'Qtd. Estoque',     key: 'stockQuantity' },
  { title: 'Ação',             key: 'action', sortable: false },
]

/* ---------- Computeds ---------- */
const stockMovements = computed(() => stockMovementStore.stockMovements)

// const typeItems = computed(() =>
//   Object.entries(stockMovementTypeLabels).map(([value, title]) => ({ value, title })),
// )

// const supplierOptions = computed(() =>
//   customerStore.suppliers.map(s => ({
//     title: `${s.code} - ${s.name}`,   
//     value: s.supplierId
//   }))
// )

// const supplierById = computed(() =>
//   Object.fromEntries(
//     customerStore.suppliers.map(s => [s.supplierId, s.name])
//   )
// )

/* ---------- Formulário ---------- */
const form = reactive<StockMovement>({
  stockMovementId: undefined,
  code: '',
  // stockMovementType: 'ELETRONIC',
  // supplier: undefined,
  // supplierPrice: 0,
  // stockQuantity: 0,
})

function resetForm() {
  form.stockMovementId     = undefined
  form.code          = ''
  // form.stockMovementType   = 'ELETRONIC'
  // form.supplier    = undefined
  // form.supplierPrice = 0
  // form.stockQuantity = 0
}

/* ---------- Lifecycle ---------- */
onMounted(() => {
  stockMovementStore.fetchStockMovements()
  // if (customerStore.suppliers.length === 0) {
  //   customerStore.fetchSuppliers()
  // }
})

/* ---------- Ações UI ---------- */
async function save() {
  saving.value = true

  const stockMovement = toRaw(form)

  if (isEditing.value) {
    await stockMovementStore.updateStockMovement(editIndex.value, stockMovement)
  } else {
    await stockMovementStore.addStockMovement(stockMovement)
  }

  saving.value = false

  // Fecha o diálogo apenas se não houve erro
  if (!stockMovementStore.error) {
    showDialog.value = false
    resetForm()
    isEditing.value  = false
  }
}

function editStockMovement(index: number) {
  const p = stockMovementStore.stockMovements[index]

  form.stockMovementId     = p.stockMovementId
  form.code          = p.code
  // form.stockMovementType   = p.stockMovementType
  // form.supplier      = p.supplier
  // form.supplierPrice = p.supplierPrice
  // form.stockQuantity = p.stockQuantity

  editIndex.value = index
  isEditing.value = true
  showDialog.value = true
}

async function deleteStockMovement(index: number) {
  await stockMovementStore.deleteStockMovement(index)
}

function cancel() {
  showDialog.value = false
  resetForm()
  isEditing.value = false
}

function truncate2(value: number): number {
  return Math.trunc(value * 100) / 100
}

/* ---------- Watchers ---------- */
watch(() => stockMovementStore.error, (newVal) => {
  if (newVal) showError.value = true
})
</script>

<style scoped>
/* Diminuir largura da coluna ação e centralizar */
.v-data-table__wrapper table th:nth-child(5),
.v-data-table__wrapper table td:nth-child(5) {
  width: 100px !important;
  text-align: center !important;
  padding: 0 8px !important;
  vertical-align: middle !important;
}

/* Ajustar botões na coluna ação para serem menores e menos padding */
.action-btn {
  padding: 0px !important;
  margin: 8px 2px;
}
</style>