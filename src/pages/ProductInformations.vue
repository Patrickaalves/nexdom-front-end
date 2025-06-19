<template>
  <!-- Cabeçalho ---------------------------------------------------------- -->
  <PageCard class="page-card-main" maxWidth="1000" margin="16px auto">
    <v-container fluid>
      <v-row dense>
        <v-col cols="12">
          <h1>Informações do Produto</h1>
        </v-col>
      </v-row>

      <!-- Campo de pesquisa --------------------------------------------- -->
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

      <!-- Feedbacks ------------------------------------------------------ -->
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

  <!-- Cartão com informações -------------------------------------------- -->
  <div id="product-info-container">
    <PageCard
      class="info-card"
      maxWidth="600"
      width="auto"
      margin="0"
      padding="24px"
    >
      <!-- Dados carregados -->
      <template v-if="productInfoStore.productProfit">
        <v-container fluid>
          <h2 class="title">Lucro por Produto</h2>

          <div class="info-list">
            <InfoItem label="Código do Produto"    :value="productInfoStore.productProfit.productCode" />
            <InfoItem label="Quantidade Vendida"   :value="productInfoStore.productProfit.totalQuantitySold.toLocaleString('pt-BR')" />
            <InfoItem label="Lucro Total"          :value="formatCurrency(productInfoStore.productProfit.totalProfit)" />
          </div>
        </v-container>
      </template>

      <!-- Placeholder -->
      <template v-else>
        <v-container fluid>
          <v-row justify="center">
            <v-col cols="12" class="text-center">
              <v-icon size="64" class="mb-2" color="grey">mdi-package-variant</v-icon>
              <p>Nenhum produto selecionado.</p>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </PageCard>
  </div>
</template>

<script setup lang="ts">
import { ref, defineComponent, h, onMounted } from 'vue'
import PageCard from '../components/PageCard.vue'
import { useProductInformationStore } from '../store/productinformation'

/* store ----------------------------------------------------------------- */
const productInfoStore = useProductInformationStore()

/* ---------- Lifecycle ---------- */
onMounted(() => {
  productInfoStore.productProfit = null;
  productInfoStore.successVisible = false;
  productInfoStore.error = '';
})

/* campo de pesquisa ----------------------------------------------------- */
const productCode = ref('')

function searchProduct() {
  productInfoStore.fetchProductProfitByCode(productCode.value.trim())
}

/* helper de formatação -------------------------------------------------- */
function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

/* InfoItem funcional (sem runtime‑compiler) ----------------------------- */
const InfoItem = defineComponent({
  name: 'InfoItem',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
  },
  setup(props) {
    return () =>
      h(
        'div',
        { class: 'info-item' },
        [
          h('span', { class: 'info-label' }, `${props.label}:`),
          h('span', { class: 'info-value' }, String(props.value)),
        ],
      )
  },
})
</script>

<style scoped>
/* layout geral */
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

/* cartão principal */
.info-card {
  flex: 1 1 500px;
  box-shadow: 0 6px 10px -4px rgba(10, 0, 0, 0.15); /* sombra apenas embaixo */
}

/* InfoItem */
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
