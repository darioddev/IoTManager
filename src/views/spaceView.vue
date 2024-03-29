<script setup>

import { reactive, onBeforeMount, ref } from 'vue';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSubCollection, getDataChanged_collection } from '@/lib/firebase.js';

const { params: { id: uid } } = useRoute();

const names = import.meta.env.VITE_APP_FIREBASE_COLLECTION_SPACE
const nameDevices = import.meta.env.VITE_APP_FIREBASE_COLLECTION_DEVICES
const nameSpace = import.meta.env.VITE_APP_FIREBASE_COLLLECTION_NAMES

const router = useRouter(); 

const spaces = reactive({
    devices: [],
    names: [],
});

const isLoading = ref(true);
const ids = reactive([])

const selectedSpace = ref('all');

const getSpaceName = (id) => {
    const name = spaces.names.find((name) => name.id === id);
    return name ? name.name : 'No se ha encontrado el nombre';
}

onBeforeMount(async () => {
    try {
        await getDataChanged_collection(names, (doc) => {
            doc.forEach((space) => ids.push(space.id))
        })
        await getSubCollection(names, uid, nameDevices, (doc) => {
            doc.forEach((device) => spaces.devices.push({ id: device.id, ...device.data() }))
        });

        await getSubCollection(names, uid, nameSpace, (doc) => {
            spaces.names.splice(0, spaces.names.length);
            doc.forEach((name) => spaces.names.push({ id: name.id, ...name.data() }))
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
        console.error(error);
    } finally {
        isLoading.value = false;
    }
})

const filteredDevices = computed(() => {
    if (selectedSpace.value === 'all') {
        return spaces.devices;
    } else {
        return spaces.devices.filter(device => device.idSpace === selectedSpace.value);
    }
});

</script>

<template>
    <div class="flex items-center justify-between bg-white p-4">
        <h1 class="text-4xl font-bold text-gray-600">
            SPACE MANAGER
        </h1>
    </div>

    <!-- Contenedor con select en la izquierda -->
    <div class="flex items-start justify-start bg-white p-4">
        <select v-model="selectedSpace" class="p-2 rounded border-gray-300 border">
            <option value="all">Todos</option>
            <option v-for="space in spaces.names" :key="space.id" :value="space.id">Espacio : {{
                space.name }}</option>
        </select>
    </div>

    <!-- Mostrar el cargando ... -->
    <div v-if="isLoading" class="flex items-center justify-center mt-20">
        <div class="flex flex-col items-center justify-center">
            <i class='bx bx-loader-alt bx-spin bx-lg text-gray-400' style="vertical-align: middle;" title="Cargando"></i>
            <p class="text-2xl font-medium text-gray-400">Cargando dispositivos...</p>
        </div>
    </div>

    <!-- Mensaje en caso de que el usuario no exista -->
    <div v-if="!ids.includes(uid) && !isLoading" class="flex items-center justify-center mt-20">
        <div class="flex flex-col items-center justify-center">
            <i class='bx bx-error bx-lg text-red-400' style="vertical-align: middle;" title="Error"></i>
            <p class="text-2xl font-medium text-red-400">El usuario no existe</p>
        </div>
    </div>

    <!-- Cards en forma de filas y en la parte izquierda saldra el nombre del espacio que pertenece -->
    <div v-if="!isLoading && ids.includes(uid)" class="flex justify-center items-center flex-wrap">
        <!-- Si no hay ningun dispositivo mostramos un mensaje -->
        <div v-if="filteredDevices.length === 0" class="p-4 m-4 flex-shrink-0">
            <div class="px-6 py-4">
                <div class="font-bold text-xl mb-2 text-gray-700">No se han encontrado dispositivos en este espacio</div>
            </div>
        </div>
        <div v-for="device in filteredDevices" :key="device.id" class="p-4 m-4 flex-shrink-0">
            <div class="max-w-xs rounded overflow-hidden shadow-lg bg-white">
                <div class="px-6 py-4">
                    <div class="font-bold text-xl mb-2">{{ device.name }}</div>
                </div>
                <div class="px-6 py-4">
                    <span
                        class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#{{
                            device.id }}</span>
                    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">#{{
                        device.type }}</span>
                </div>
                <div class="px-6 py-4">
                    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                        Este espacio pertenece a: {{ getSpaceName(device.idSpace) }}
                    </span>
                </div>
                <!--Creamos un boton azul con tailwind -->
                <div class="px-6 py-4">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        @click="router.push(`/${uid}/${device.id}`)">
                        Ver dispositivo
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped></style>