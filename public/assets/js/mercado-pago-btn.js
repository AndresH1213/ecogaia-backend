

// Agrega credenciales de SDK
const mp = new MercadoPago('APP_USR-5acaa1ba-b131-40ae-a5df-a0c3cbb30abc', {
    locale: 'es-CO'
});

// Inicializa el checkout
mp.checkout({
    preference: {
        id: localStorage.getItem('preferenceId')
    },
    render: {
        container: '.cho-container', // Indica el nombre de la clase donde se mostrará el botón de pago
        label: 'Pagar', // Cambia el texto del botón de pago (opcional)
    }
});