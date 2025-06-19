<template>
  <PageCard class="page-card-main" maxWidth="1000" margin="16px auto">
    <v-container fluid>
      <v-row dense>
        <v-col cols="16" md="6">
          <h1>Informações do Produto</h1>
        </v-col>
      </v-row>
    </v-container>
  </PageCard>

  <div id="container-product-informations">
    <PageCard
      class="page-card-informations"
      maxWidth="600"
      width="auto"
      margin="0"
      padding="24px"
    >
      <v-container fluid>
        <v-row dense>
          <v-col>
            <h1>Lucro Por Produto</h1>
          </v-col>
        </v-row>
      </v-container>
    </PageCard>

    <PageCard
      class="page-card-informations"
      maxWidth="600"
      width="auto"
      margin="0"
      padding="24px"
    >
      <v-container fluid>
        <v-row dense>
          <v-col>
            <h1>Quantidade atual/vendida</h1>
          </v-col>
        </v-row>
      </v-container>
    </PageCard>
  </div>
</template>

<script setup lang="ts">
import PageCard from '../components/PageCard.vue'
</script>

<style scoped>
#container-product-informations {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;

  width: 100%;
  max-width: 100%;
  padding: 0 32px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.page-card-informations {
  flex: 1 1 500px;
  box-shadow: 10px 4px 6px -2px rgba(10, 0, 0, 0.15);
}
</style>
