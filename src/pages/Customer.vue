<template>
  <PageCard>
    <v-container fluid>
      <v-row dense>
        <v-col>
          <h1>Cliente</h1>
          <v-btn @click="showDialog = true" color="green-darken-1">Novo Cliente</v-btn>
          <v-data-table :items="customers" :headers="headers" fixed-header height="570px" class="mt-2"
            style="max-width: 100%;">
            <template #item.phone="{ item }">
              {{ item.phone == null ? "SEM CADASTRO" : item.phone }}
            </template>

            <template #item.action="{ index }">
              <v-btn icon small class="action-btn" color="blue-darken-2" @click="editCustomer(index)" >
                <v-icon size="18">mdi-pencil-outline</v-icon>
              </v-btn>
              <v-btn icon small class="action-btn" color="red-darken-2" @click="deleteCustomer(index)">
                <v-icon size="18">mdi-trash-can-outline</v-icon>
              </v-btn>
            </template>

            <template #header.action>
              <th style="width: 100px; text-align: center; font-weight: 100;">Ação</th>
            </template>
          </v-data-table>

          <v-snackbar 
            v-model="customerStore.successVisible" 
            :timeout="3000" 
            color="success" 
            location="top right"
            @update:model-value="val => { if (!val) customerStore.successVisible = false }"
          >
            <span class="text-center w-100">{{ customerStore.successMessage }}</span>
          </v-snackbar>

          <v-snackbar
            v-model="showError"
            :timeout="5000"
            color="error"
            top
            @update:model-value="val => { if (!val) customerStore.error = null }"
          >
            <span class="text-center w-100">{{ customerStore.error }}</span>
          </v-snackbar>

          <v-dialog v-model="showDialog" max-width="500">
            <v-card>
              <v-card-title>{{ isEditing ? 'Editar Cliente' : 'Novo Cliente' }}</v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="form.code"
                  label="Código"
                  :rules="[rules.required]"
                  :error="form.code !== '' && rules.required(form.code) !== true"
                  :success="rules.required(form.code) === true"
                />

                <v-text-field
                  v-model="form.name"
                  label="Nome"
                  :rules="[rules.required]"
                  :error="form.name !== '' && rules.required(form.name) !== true"
                  :success="rules.required(form.name) === true"
                />

                <v-text-field
                  label="Telefone"
                  :model-value="formatPhone(form.phone)"
                  @update:model-value="val => form.phone = unformat(val)"
                  :rules="[rules.phone]"
                  :error="form.phone !== '' && rules.phone(form.phone) !== true"
                  :success="form.phone !== '' && rules.phone(form.phone) === true"
                />
              </v-card-text>

              <v-card-actions>
                <v-btn text @click="cancel">Cancelar</v-btn>
                <v-btn color="primary" :loading="saving" @click="save">Salvar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
    </v-container>
  </PageCard>
</template>


<script setup lang="ts">
import { ref, reactive, computed, onMounted, toRaw, watch } from 'vue'
import {useCustomerStore, type Customer } from '../store/customer'
import PageCard from '../components/PageCard.vue'

/* ---------- Store ---------- */
const customerStore = useCustomerStore()

/* ---------- Estado local ---------- */
const showDialog = ref(false)
const showError  = ref(false)
const isEditing  = ref(false)
const editIndex  = ref(-1)
const saving     = ref(false)

/* ---------- Cabeçalhos ---------- */
const headers = [
  { title: 'Código',          key: 'code' },
  { title: 'Nome',            key: 'name' },
  { title: 'Telefone',        key: 'phone' },
  { title: 'Ação',            key: 'action', sortable: false },
]

/* ---------- Computeds ---------- */
const customers = computed(() => customerStore.customers)

const form = reactive<Customer>({
  customerId: undefined,
  code: '',
  name: '',
  phone: ''
})

function resetForm() {
  form.customerId = undefined,
  form.code       = '',
  form.name       = '',
  form.phone      = ''
}

/* ---------- Lifecycle ---------- */
onMounted(() => {
  customerStore.fetchCustomers()
})

/* ---------- Ações UI ---------- */

async function save() {
  saving.value = true;
  const customer = toRaw(form)

  if (isEditing.value) {
    await customerStore.updateCustomer(editIndex.value, customer)
  } else {
    await customerStore.addCustomer(customer)
  }

  saving.value = false;

  if (!customerStore.error) {
    showDialog.value = false
    resetForm()
    isEditing.value  = false
  }
}

function editCustomer(index: number) {
  const p = customerStore.customers[index]

  form.customerId = p.customerId
  form.code       = p.code
  form.name       = p.name
  form.phone      = p.phone

  editIndex.value = index
  isEditing.value = true
  showDialog.value = true
}

async function deleteCustomer(index: number) {
  await customerStore.deleteCustomer(index)
}

/* ---------- Watchers ---------- */
watch(() => customerStore.error, (newVal) => {
  if (newVal) showError.value = true
})

function cancel() {
  showDialog.value = false
  resetForm()
  isEditing.value = false
}

/* ---------- Functions ---------- */
const rules = {
  required: (v: string) => !!v || 'Campo obrigatório',
  phone: (v: string) => !v || v.length >= 10 || 'Telefone inválido', 
}

function formatPhone(value: string): string {
  if (!value) return ''
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
}

function unformat(value: string): string {
  return value.replace(/\D/g, '') // Remove tudo que não é número
}

function isFormValid(): boolean {
  const codeOk  = rules.required(form.code)  === true
  const nameOk  = rules.required(form.name)  === true
  const phoneOk = rules.phone(form.phone)    === true

  return codeOk && nameOk && phoneOk
}

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
