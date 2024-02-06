<script setup>

import selectComponent from '@/components/selectComponent.vue'

import { ref, reactive, onBeforeMount } from 'vue'
import { getSubDocument, updateSubCollection, getSubCollection } from '@/lib/firebase.js'
import { success } from '@/lib/messages.js'
import { controlDevice } from '@/lib/controlDevices.js'
import { hasEmptyFields } from '@/lib/utils.js'
import { useRoute, useRouter } from 'vue-router'

const { params: { id: uid, device: idDevice } } = useRoute();
const router = useRouter();



const nameSpace = import.meta.env.VITE_APP_FIREBASE_COLLECTION_SPACE // Nombre de la colección de espacios 
const nameDevices = import.meta.env.VITE_APP_FIREBASE_COLLECTION_DEVICES // Nombre de la colección de dispositivos
const device = ref({}) // Variable reactiva donde almacenamos el dispositivo que estamos consultando
const devices = reactive([]) // Variable reactiva donde almacenamos todos los dispositivos del usuario
const dataSelects = reactive([]) // Variable reactiva donde almacenammos los datos de los selects en este caso si es un sensor o un ejecutor
const errorMessage = ref('') // Variable reactiva para mostrar mensajes de error

const editableField = ref(null) // Variable reactiva para saber que campo estamos editando

const editField = (field) => {
    editableField.value = field
}

const isExistName = (newName) => {
    // Filtramos por el espacio del sensor/ejecutor que tenemos para comprobar el nombre
    const filter = devices.filter(el => el.idSpace === device.value.idSpace && el.type === device.value.type && el.id !== device.value.id)
    return filter.some(el => el.name === newName)
}

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

const saveField = async () => {
    try {
        if (hasEmptyFields(device.value)) { // Si el usuario intenta guardar un campo vacío le mostramos un mensaje de error y no guardamos los cambios
            errorMessage.value = 'No puedes guardar un dato vacio'
            await reloadData()
            console.log('entre..')

        } else {
            if (editableField.value === 'name') {
                if (isExistName(device.value.name)) {
                    await reloadData()
                    errorMessage.value = 'El nombre ya existe en el espacio seleccionado'
                } else {
                    await updateSubCollection(nameSpace, uid, nameDevices, idDevice, { name: device.value.name })
                    editableField.value = null
                    success('Cambios guardados')
                    errorMessage.value = ''
                }
            } else {
                await updateSubCollection(nameSpace, uid, nameDevices, idDevice, { [editableField.value]: device.value[editableField.value] })
                editableField.value = null
                success('Cambios guardados')
                errorMessage.value = ''
            }
        }
        editableField.value = null // Limpiamos el campo editable
    } catch (error) {
        console.error(error)
    }
}
const reloadData = async () => {
    await getSubDocument(nameSpace, uid, nameDevices, idDevice, (data) => {
        device.value = { id: data.id, ...data.data() }
    })
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
                <i class='bx bx-arrow-back bx-lg text-gray-400 cursor-pointer p-4' style="vertical-align: middle;" title="Volver"
                    @click="router.push({ name: 'space', params: { id: uid } })"></i>
            </div>
        </div>

        <!-- Contenedor con botón con interrogación que muestre el significado de los iconos -->
        <div class="flex items-start justify-start p-1 ">
            <div v-if="errorMessage" class="flex items-center justify-start text-red-500  p-2 rounded-lg">
                <i class='bx bx-error bx-lg' style="vertical-align: middle;" title="Error"></i>
                <p class="text-lg font-medium">{{ errorMessage }}</p>
            </div>
        </div>
        <!--Mostramos la informacion del dispositivo-->
        <div class="h-screen">
            <div v-if="device.type === 'sensor'" class="flex flex-col items-start justify-start m-4">
                <p class="text-2xl font-medium text-gray-600 p-4">
                    <i :class="['bx', 'bx-id-card', 'bx-lg', 'text-gray-400']" style="vertical-align: middle;"
                        title="ID del dispositivo"></i>
                    {{ device.id }}
                </p>
                <p class="text-2xl font-medium text-gray-600 p-4" @dblclick="editField('name')">
                    <i :class="['bx', 'bx-rename', 'bx-lg', 'text-gray-400']" style="vertical-align: middle;"
                        title="Nombre del dispositivo"></i>
                    <span v-if="editableField !== 'name'" class="cursor-pointer">{{ device.name }}</span>
                    <input v-else v-model="device.name" @blur="saveField" @keyup.enter="saveField">
                </p>
                <p class="text-2xl font-medium text-gray-600 p-4 " title="Unidad de medida del sensor"
                    @dblclick="editField('unit')">
                    <i :class="['bx', device.type === 'sensor' ? 'bx-radar' : 'bx-devices', 'bx-lg', 'text-gray-400']"
                        style="vertical-align: middle;" title="Dispositivo asociado"></i>
                    <span v-if="editableField !== 'unit'" class="cursor-pointer">
                        {{ device.unit }}
                    </span>
                    <selectComponent v-else name="unit" :elementos="dataSelects" :selectedValue="device.unit"
                        @update:selectedValue="device.unit = $event" @blur="saveField" @change="saveField" />
                </p>

                <p class="text-base font-medium flex items-center p-4" title="Valor del sensor"
                    @dblclick="editField('value')">
                    <!--Icono de valor base de datos con el valor -->
                    <i class='bx bxs-data bx-lg text-gray-400' title="Valor del sensor"></i>
                    <span v-if="editableField !== 'value'" class="text-2xl font-medium text-gray-600 p-4 cursor-pointer"
                        title="Valor base de datos">
                        {{ device.value }}
                    </span>
                    <input v-else v-model="device.value" @blur="saveField" @keyup.enter="saveField">
                </p>

                <div class="flex items 
                -center justify-center m-2">
                    <!-- Mensaje informativo indicando que para modificar el nombre o dispositivo ahi que hacer doble click -->
                    <p class="text-base font-medium text-gray-600">
                        <span>Para modificar el nombre , la undiad o el valor asociado haga doble click sobre el
                            campo.</span>
                        <br>
                        <span>Cuando termine su modificacion haga click en enter o en cualquier click en cualquier parte de
                            la pantalla.</span>
                    </p>

                </div>

            </div>

            <div v-else-if="device.type === 'executor'" class="flex flex-col items-start justify-start h-screen m-4">

                <p class="text-2xl font-medium text-gray-600 p-4">
                    <i :class="['bx', 'bx-id-card', 'bx-lg', 'text-gray-400']" style="vertical-align: middle;"
                        title="ID del dispositivo"></i>
                    {{ device.id }}
                </p>
                <p class="text-2xl font-medium text-gray-600 p-4" @dblclick="editField('name')">
                    <i :class="['bx', 'bx-rename', 'bx-lg', 'text-gray-400']" style="vertical-align: middle;"
                        title="Nombre del dispositivo"></i>
                    <span v-if="editableField !== 'name'">{{ device.name }}</span>
                    <input v-else v-model="device.name" @blur="saveField" @keyup.enter="saveField">
                </p>
                <p class="text-2xl font-medium text-gray-600 p-4" title="Dispositivo conectado "
                    @dblclick="editField('executor')">
                    <i :class="['bx', device.type === 'sensor' ? 'bx-radar' : 'bx-devices', 'bx-lg', 'text-gray-400']"
                        style="vertical-align: middle;" title="Dispositivo asociado"></i>
                    <span v-if="editableField !== 'executor'">
                        {{ device.executor }}
                    </span>
                    <selectComponent v-else name="executor" :elementos="dataSelects" :selectedValue="device.executor"
                        @update:selectedValue="device.executor = $event" @blur="saveField" @change="saveField" />

                </p>
                <p class="text-2xl font-medium text-gray-600 p-4" title="Estado del dispositivo">
                    <i :class="['bx', Number(device.state) === 1 ? 'bxs-toggle-right' : 'bxs-toggle-left', 'bx-lg', 'cursor-pointer', Number(device.state) === 1 ? 'text-green-500' : 'text-red-500', 'rounded-full', 'transition-opacity duration-300 ease-in-out']"
                        style="vertical-align: middle; opacity: 1;" title="Estado del ejecutor"
                        @click="controlDevice.updateDevice(uid, idDevice, { state: Number(device.state) === 1 ? 0 : 1 })"></i>
                    {{ Number(device.state) === 1 ? 'Encendido' : 'Apagado' }}
                </p>
                <div class="flex items 
                -center justify-center m-2">
                    <!-- Mensaje informativo indicando que para modificar el nombre o dispositivo ahi que hacer doble click -->
                    <p class="text-base font-medium text-gray-600">
                        <span>Para modificar el nombre o el dispositivo asociado haga doble click sobre el campo.</span>
                        <br>
                        <span>Cuando termine su modificacion haga click en enter o en cualquier click en cualquier parte de
                            la pantalla.</span>
                    </p>
                </div>


            </div>


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