<template>
  <PageCard class="page-card-main" maxWidth="1000" margin="16px auto">
    <v-container fluid>
      <v-row dense>
        <v-col cols="12">
          <h1>Informações do Produto</h1>
        </v-col>
      </v-row>

      <v-row dense align="center" class="mt-4">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="productCode"
            label="Código do Produto"
            prepend-inner-icon="mdi-package-variant"
            clearable
            hide-details="auto"
            :disabled="productInfoStore.loading"
            @keyup.enter="searchProduct"
          />
        </v-col>

        <v-col cols="12" sm="3" md="2">
          <v-btn
            color="primary"
            block
            :loading="productInfoStore.loading"
            @click="searchProduct"
          >
            Buscar
            <template #loader>
              <v-progress-circular indeterminate size="20" />
            </template>
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-alert
            v-if="productInfoStore.error"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ productInfoStore.error }}
          </v-alert>

          <v-alert
            v-else-if="productInfoStore.successVisible"
            type="success"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            {{ productInfoStore.successMessage }}
          </v-alert>
        </v-col>
      </v-row>
    </v-container>
  </PageCard>

  <div id="product-info-container">
    <PageCard
      v-if="productInfoStore.productProfit"
      class="info-card"
      maxWidth="600"
      margin="0"
      padding="24px"
    >
      <v-container fluid>
        <h2 class="title">Lucro por Produto</h2>

        <div class="info-list">
          <InfoItem
            label="Código do Produto"
            :value="productInfoStore.productProfit.productCode"
          />

         <InfoItem
            label="Quantidade Vendida"
            :value="productInfoStore.productProfit?.totalQuantitySold
              ? productInfoStore.productProfit.totalQuantitySold.toLocaleString('pt-BR')
              : '' "
          />
          <InfoItem
            label="Valor Bruto"
            :value="formatCurrency(productInfoStore.productProfit.totalGrossRevenue)"
          />
          <InfoItem
            label="Lucro Total"
            :value="formatCurrency(productInfoStore.productProfit.totalProfit)"
          />
        </div>
      </v-container>
    </PageCard>

    <PageCard
      v-if="productInfoStore.productStock"
      class="info-card"
      maxWidth="600"
      margin="0"
      padding="24px"
    >
      <v-container fluid>
        <h2 class="title">Estoque e Saída</h2>

        <div class="info-list">
          <InfoItem
            label="Tipo"
            :value="productTypeLabels[productInfoStore.productStock.productType] ||
                    productInfoStore.productStock.productType"
          />
          <InfoItem
            label="Quantidade Saída"
            :value="productInfoStore.productStock.quantityOut"
          />
          <InfoItem
            label="Quantidade em Estoque"
            :value="productInfoStore.productStock.stockQuantity"
          />
        </div>
      </v-container>
    </PageCard>

    <PageCard
      v-if="!productInfoStore.productProfit && !productInfoStore.productStock"
      class="info-card"
      maxWidth="600"
      margin="0"
      padding="24px"
    >
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="12" class="text-center">
            <v-icon size="64" class="mb-2" color="grey">mdi-package-variant</v-icon>
            <p>Nenhum produto selecionado.</p>
          </v-col>
        </v-row>
      </v-container>
    </PageCard>

  </div>
</template>

<script setup lang="ts">
import { ref, defineComponent, h, onMounted } from 'vue'
import PageCard from '../components/PageCard.vue'
import { useProductInformationStore } from '../store/productinformation'
import { productTypeLabels } from '../constants/product-types'

/* store */
const productInfoStore = useProductInformationStore()

/* Limpa estado ao montar */
onMounted(() => {
  productInfoStore.productProfit = null
  productInfoStore.productStock  = null
  productInfoStore.successVisible = false
  productInfoStore.error = ''
})

/* Campo de pesquisa */
const productCode = ref('')

function searchProduct() {
  productInfoStore.fetchAllByCode(productCode.value.trim())
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

const InfoItem = defineComponent({
  name: 'InfoItem',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'info-item' }, [
        h('span', { class: 'info-label' }, `${props.label}:`),
        h('span', { class: 'info-value' }, String(props.value)),
      ])
  },
})
</script>

<style scoped>
#product-info-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  width: 100%;
  padding: 0 32px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.info-card {
  flex: 1 1 500px;
  box-shadow: 0 6px 10px -4px rgba(10, 0, 0, 0.15);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 15px;
}

.info-label {
  font-weight: 600;
  color: #555;
}

.info-value {
  color: #222;
}

.title {
  font-size: 1.3rem;
  margin-bottom: 16px;
}
</style>
