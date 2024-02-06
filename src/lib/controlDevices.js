import { getDataChanged_collection, updateSubCollection } from './firebase.js'

/**
 * Funcion que obtiene los datos de una colección de la base de datos
 * @param {string} collectionName
 */
const fetchDataFromCollection = (collectionName) => {
  return new Promise((resolve) => {
    getDataChanged_collection(collectionName, (snapshot) => {
      resolve(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
  })
}

export const controlDevice = {
  name: import.meta.env.VITE_APP_FIREBASE_COLLECTION_DEVICES, // Nombre de la colección de dispositivos
  space: import.meta.env.VITE_APP_FIREBASE_COLLECTION_SPACE, // Nombre de la coleccion padre de los dispositivos

  unitName: import.meta.env.VITE_APP_FIREBASE_COLLECTION_UNITS, // Nombre de la colección de unidades de medida
  executorName: import.meta.env.VITE_APP_FIREBASE_COLLECTION_EXECUTORS, // Nombre de la colección de ejecutores

  async getUnits() {
    // Obtenemos las unidades de medida de la base de datos
    return await fetchDataFromCollection(this.unitName) // Llamamos a la función que nos permite obtener los datos de una colección
  },

  async getExecutors() {
    // Obtenemos los ejecutores de la base de datos
    return await fetchDataFromCollection(this.executorName) // Llamamos a la función que nos permite obtener los datos de una colección
  },
  async updateDevice(id, idDevice, data) {
    await updateSubCollection(this.space, id, this.name, idDevice, data)
  }
}
