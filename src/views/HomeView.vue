<script setup>
const redirect = () => {
  window.open('https://darioddev.github.io/IoT')
}
</script>
<template>
  <div class="bg-gray-200 min-h-screen flex items-center justify-center" id="main">
    <div class="absolute top-0 right-0 p-4">
      <buttonThemeComponet />
    </div>
    <div class="flex flex-col items-center justify-center text-center text-black">
      <h1 class="text-6xl font-bold mb-4 text-blue-700">
          IoTManager
      </h1>
      <!-- Contenedor con un button -->
      <div class="flex flex-col items-center justify-center">
        <p
        class="text-2xl font-bold text-gray-700"
        >Usted para poder acceder a IoTManager debe acceder desde el dashboard de IoT</p>
        <!-- Dos botones redireccionando a IoT-->
        <div class="flex flex-col items-center justify-center">
          <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full m-4"
          @click="redirect"
          >Ir a IoT</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

* {
  animation: fadeIn 2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

</style>