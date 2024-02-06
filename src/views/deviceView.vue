<script setup>

import selectComponent from '@/components/selectComponent.vue'

import { ref, reactive, onBeforeMount } from 'vue'
import { getSubDocument, updateSubCollection, getSubCollection } from '@/lib/firebase.js'
import { controlDevice } from '@/lib/controlDevices.js'
import { hasEmptyFields } from '@/lib/utils.js'
import { useRoute } from 'vue-router'

const { params: { id: uid, device: idDevice } } = useRoute();



const nameSpace = import.meta.env.VITE_APP_FIREBASE_COLLECTION_SPACE // Nombre de la colección de espacios 
const nameDevices = import.meta.env.VITE_APP_FIREBASE_COLLECTION_DEVICES // Nombre de la colección de dispositivos
const device = ref({}) // Variable reactiva donde almacenamos el dispositivo que estamos consultando
const devices = reactive([]) // Variable reactiva donde almacenamos todos los dispositivos del usuario
const dataSelects = reactive([]) // Variable reactiva donde almacenammos los datos de los selects en este caso si es un sensor o un ejecutor
const showTooltip = ref(false) // Variable reactiva para mostrar el tooltip

const editableField = ref(null) // Variable reactiva para saber que campo estamos editando

const getDataSelect = async () => {
    dataSelects.splice(0, dataSelects.length)
    if (device.value.type === 'sensor') {
        const units = await controlDevice.getUnits()
        units.map(unit => dataSelects.push({ ...unit }))
    }
    if (device.value.type === 'executor') {
        const devices = await controlDevice.getExecutors()
        devices.map(device => dataSelects.push({ ...device }))
    }
}

// Obtenemos el dispositivo que estamos consultando , para ello pasamos el espacio y el id del dispositivo recibido por parámetro
// y lo almacenamos en la variable reactiva device 
onBeforeMount(async () => {
    try {
        await getSubDocument(nameSpace, uid, nameDevices, idDevice, async (data) => {
            device.value = { id: data.id, ...data.data() }
            await getDataSelect()
        })
        // Obtenemos los cambios en la colección de dispositivos
        await getSubCollection(nameSpace, uid, nameDevices, (data) => {
            devices.splice(0, devices.length)
            data.forEach((doc) => devices.push({ id: doc.id, ...doc.data() }))
        })

    } catch (error) {
        console.error(error)
    }
})


const editField = (field) => {
    editableField.value = field
}

const isExistName = (newName) => {
    // Filtramos por el espacio del sensor/ejecutor que tenemos para comprobar el nombre
    const filter = devices.filter(el => el.idSpace === device.value.idSpace && el.type === device.value.type && el.id !== device.value.id)

    console.log(filter)
}


const saveField = async () => {
    isExistName()
    if (hasEmptyFields(device.value)) {
        alert('No puedes dejar campos vacíos. Por favor, llena todos los campos.')
        await getSubDocument(nameSpace, uid, nameDevices, idDevice, (data) => {
            device.value = { ...data.data() }
        })
    } else {
        if (confirm('¿Estás seguro de que quieres guardar los cambios?')) {
            await updateSubCollection(nameSpace, uid, nameDevices, idDevice, device.value)
        }
    }
    editableField.value = null
}




</script>

<template>
    <main class="bg-gray-200">
        <div v-if="!device.id" class="flex items-center justify-center h-screen">
            <div class="flex flex-col items-center justify-center">
                <i class='bx bx-loader-alt bx-spin bx-lg text-gray-400' style="vertical-align: middle;"
                    title="Cargando"></i>
                <p class="text-2xl font-medium text-gray-400">Cargando dispositivo...</p>
            </div>
        </div>
        <div v-if="!device.type" class="flex items-center justify-center h-screen">
            <div class="flex flex-col items-center justify-center">
                <i class='bx bx-error bx-lg text-red-500' style="vertical-align: middle;" title="Error"></i>
                <p class="text-2xl font-medium text-red-500">No se ha encontrado el dispositivo</p>
            </div>
        </div>

        <div v-if="device.type" class="flex items-center justify-between bg-white p-4">
            <h1 class="text-4xl font-bold text-gray-600">
                <i :class="['bx', device.type === 'sensor' ? 'bx-radar' : 'bx-devices', 'bx-lg', 'text-gray-400']"
                    style="vertical-align: middle;" title="Nombre del dispositivo"></i>
                {{ device.type === 'sensor' ? 'Sensor' : 'Ejecutor' }}
            </h1>
            <div class="flex items-center justify-center">
                <i class='bx bx-trash bx-lg text-red-500 cursor-pointer' title="Eliminar dispositivo"
                    @click="deleteDevice"></i>
            </div>
        </div>

        <!-- Contenedor con botón con interrogación que muestre el significado de los iconos -->
        <div class="flex items-end justify-start p-1 ">
            <i class='bx bx-help-circle bx-lg text-gray-400 cursor-pointer mr-2' title="Mostrar significado de los iconos"/>
            <!-- Boton que al pulsar mostrara detalle -->
            
        </div>




        <!--Mostramos la informacion del dispositivo-->
        <div v-if="device.type === 'sensor'" class="flex flex-col items-center justify-start h-screen">
            <p class="text-2xl font-medium" @dblclick="editField('name')">
                <span v-if="editableField !== 'name'">
                    Nombre :
                    {{ device.name }}</span>
                <input v-else v-model="device.name" @blur="saveField" @keyup.enter="saveField">
            </p>
            <p class="text-2xl font-medium" @dblclick="editField('sensor')">
                <span v-if="editableField !== 'sensor'">
                    Dispositivo :
                    {{ device.sensor }}</span>
                <input v-else v-model="device.sensor" @blur="saveField" @keyup.enter="saveField">
            </p>
            <p class="text-2xl font-medium" @dblclick="editField('unit')">
                <span v-if="editableField !== 'unit'">
                    Unidad :
                    {{ device.unit }}</span>
                <select v-else v-model="device.unit" @blur="saveField" @change="saveField">
                    <option v-for="unit in dataSelects" :key="unit.id" :value="unit.id">
                        {{ unit.name }}
                    </option>
                </select>
            </p>
            <p class="text-base font-medium text-white flex items-center">
                <i :class="['bx', Number(device.state) === 1 ? 'bxs-toggle-right' : 'bxs-toggle-left', 'bx-lg', 'cursor-pointer', Number(device.state) === 1 ? 'text-green-500' : 'text-red-500', 'rounded-full', 'transition-opacity duration-300 ease-in-out']"
                    style="vertical-align: middle; opacity: 1;" title="Estado del sensor"
                    @click="updateSubCollection('spaces', '57lit48xYghqFzozaW4gEa2bkY22', 'devices', '8DY21lkfFUJ4wrC78ar0', { state: Number(device.state) === 1 ? 0 : 1 })"></i>
            </p>
        </div>

        <div v-else-if="device.type === 'executor'" class="flex flex-col items-start justify-start h-screen m-4">

            <p class="text-2xl font-medium text-gray-600 p-4">
                <i :class="['bx', 'bx-id-card', 'bx-lg', 'text-gray-400']" style="vertical-align: middle;"
                    title="ID del dispositivo"></i>
                {{ device.id }}
            </p>
            <p class="text-2xl font-medium text-gray-600 p-4">
                <i :class="['bx', 'bx-rename', 'bx-lg', 'text-gray-400']" style="vertical-align: middle;"
                    title="Nombre del dispositivo"></i>
                {{ device.name }}
            </p>
            <p class="text-2xl font-medium text-gray-600 p-4">
                <i :class="['bx', device.type === 'sensor' ? 'bx-radar' : 'bx-devices', 'bx-lg', 'text-gray-400']"
                    style="vertical-align: middle;" title="Dispositivo asociado"></i>
                {{ device.type === 'sensor' ? device.sensor : device.executor }}
            </p>
            <p class="text-2xl font-medium text-gray-600 p-4">
                <i :class="['bx', Number(device.state) === 1 ? 'bxs-toggle-right' : 'bxs-toggle-left', 'bx-lg', 'cursor-pointer', Number(device.state) === 1 ? 'text-green-500' : 'text-red-500', 'rounded-full', 'transition-opacity duration-300 ease-in-out']"
                    style="vertical-align: middle; opacity: 1;" title="Estado del ejecutor"
                    @click="controlDevice.updateDevice(uid, idDevice, { state: Number(device.state) === 1 ? 0 : 1 })"></i>
                {{ Number(device.state) === 1 ? 'Encendido' : 'Apagado' }}
            </p>
        </div>
    </main>
</template>


<style scoped>
select {
    padding: 0.5rem;
    margin: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 100%;
    font-size: 1rem;
    cursor: pointer;
}

select option {
    padding: 0.5rem;
    margin: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 100%;
    font-size: 1rem;
    cursor: pointer;
}
</style>