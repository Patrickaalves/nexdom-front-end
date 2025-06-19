<template>
  <PageCard>
    <v-container fluid>
      <v-row dense>
        <v-col>
          <h1>Fornecedor</h1>
          <v-btn @click="showDialog = true" color="green-darken-1">Novo Fornecedor</v-btn>
          <v-data-table :items="suppliers" :headers="headers" fixed-header height="570px" class="mt-2"
            style="max-width: 100%;">
            <template #item.phone="{ item }">
              {{ item.phone == null ? "SEM CADASTRO" : item.phone }}
            </template>

            <template #item.action="{ index }">
              <v-btn icon small class="action-btn" color="blue-darken-2" @click="editSupplier(index)" >
                <v-icon size="18">mdi-pencil-outline</v-icon>
              </v-btn>
              <v-btn icon small class="action-btn" color="red-darken-2" @click="deleteSupplier(index)">
                <v-icon size="18">mdi-trash-can-outline</v-icon>
              </v-btn>
            </template>

            <template #header.action>
              <th style="width: 100px; text-align: center; font-weight: 100;">Ação</th>
            </template>
          </v-data-table>

          <v-snackbar 
            v-model="supplierStore.successVisible" 
            :timeout="3000" 
            color="success" 
            location="top right"
            @update:model-value="val => { if (!val) supplierStore.successVisible = false }"
          >
            <span class="text-center w-100">{{ supplierStore.successMessage }}</span>
          </v-snackbar>

          <v-snackbar
            v-model="showError"
            :timeout="5000"
            color="error"
            top
            @update:model-value="val => { if (!val) supplierStore.error = null }"
          >
            <span class="text-center w-100">{{ supplierStore.error }}</span>
          </v-snackbar>

          <v-dialog v-model="showDialog" max-width="500">
            <v-card>
              <v-card-title>{{ isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor' }}</v-card-title>
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
                  label="CNPJ"
                  :model-value="formatCNPJ(form.cnpj)"
                  @update:model-value="val => form.cnpj = unformat(val)"
                  :rules="[rules.required, cnpjRule]"
                  :error="form.cnpj !== '' && (rules.required(form.cnpj) !== true || rules.cnpj(form.cnpj) !== true)"
                  :success="rules.required(form.cnpj) === true && rules.cnpj(form.cnpj) === true"
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
import {useSupplierStore, type Supplier } from '../store/supplier'
import PageCard from '../components/PageCard.vue'

/*  Store  */
const supplierStore = useSupplierStore()

/*  Estado local  */
const showDialog = ref(false)
const showError  = ref(false)
const isEditing  = ref(false)
const editIndex  = ref(-1)
const saving     = ref(false)

/*  Cabeçalhos  */
const headers = [
  { title: 'Código',          key: 'code' },
  { title: 'Nome',            key: 'name' },
  { title: 'Cnpj',            key: 'cnpj' },
  { title: 'Telefone',        key: 'phone' },
  { title: 'Ação',            key: 'action', sortable: false },
]

/*  Computeds  */
const suppliers = computed(() => supplierStore.suppliers)

const form = reactive<Supplier>({
  supplierId: undefined,
  code: '',
  name: '',
  cnpj: '',
  phone: ''
})

function resetForm() {
  form.supplierId = undefined,
  form.code       = '',
  form.name       = '',
  form.cnpj       = '',
  form.phone      = ''
}

/*  Lifecycle  */
onMounted(() => {
  supplierStore.fetchSuppliers()
})

/*  Ações UI  */

async function save() {
  saving.value = true;
  const supplier = toRaw(form)

  if (isEditing.value) {
    await supplierStore.updateSupplier(editIndex.value, supplier)
  } else {
    await supplierStore.addSupplier(supplier)
  }

  saving.value = false;

  // Fecha o diálogo apenas se não houve erro
  if (!supplierStore.error) {
    showDialog.value = false
    resetForm()
    isEditing.value  = false
  }
}

function editSupplier(index: number) {
  const p = supplierStore.suppliers[index]

  form.supplierId = p.supplierId
  form.code       = p.code
  form.name       = p.name
  form.cnpj       = p.cnpj
  form.phone      = p.phone

  editIndex.value = index
  isEditing.value = true
  showDialog.value = true
}

async function deleteSupplier(index: number) {
  await supplierStore.deleteSupplier(index)
}

/*  Watchers  */
watch(() => supplierStore.error, (newVal) => {
  if (newVal) showError.value = true
})

function cancel() {
  showDialog.value = false
  resetForm()
  isEditing.value = false
}


/*  Functions  */
function formatCNPJ(value: string): string {
  if (!value) return ''
  return value
    .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5')
}

const rules = {
  required: (v: string) => !!v || 'Campo obrigatório',
  cnpj: (v: string) => v.length === 14 || 'CNPJ inválido',
  phone: (v: string) => !v || v.length >= 10 || 'Telefone inválido', 
}

const cnpjRule = (v: string) => {
  const digits = v.replace(/\D/g, '')      // remove tudo que não é número
  return digits.length === 14 || 'CNPJ inválido'
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
  const cnpjOk  = rules.cnpj(form.cnpj)      === true
  const phoneOk = rules.phone(form.phone)    === true

  return codeOk && nameOk && cnpjOk && phoneOk
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
