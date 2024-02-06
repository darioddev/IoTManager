/**
 * Funcion que comprueba si un objecto tiene campos vacios , primero se convierte el objeto en un array de sus valores
 * Despues se comprueba si alguno de esos valores es igual a un string vacio , con el metodo de array some()
 * Si alguno de los valores es igual a un string vacio, la funcion devuelve true
 * @param {object} obj
 * @returns {boolean}
 */
export const hasEmptyFields = (obj) => Object.values(obj).some((value) => value === '')
