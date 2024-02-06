export const success = (message) => {
  Toastify({
    text: message,
    backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)',
    duration: 3000
  }).showToast()
}

