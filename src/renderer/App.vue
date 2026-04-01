<script setup lang="ts">
import { ref } from 'vue';

const message = ref('Hello Vue 3 + Electron!');
</script>

<template>
  <div class="app">
    <h1>{{ message }}</h1>
    <p>Welcome to GLM5 Mind Map</p>
  </div>
</template>

<style scoped>
.app {
  text-align: center;
  padding: 20px;
}

h1 {
  color: #42b883;
}
</style>
