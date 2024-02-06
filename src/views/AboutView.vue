<script setup>
//Importar o router para acceder a las rutas
import { useRoute } from 'vue-router'
import { ref } from 'vue'

//Obtener el usuario de la ruta
const route = useRoute()

const id = ref(route.params.id)
console.log(id.value)

</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
