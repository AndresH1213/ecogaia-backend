const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    cart: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        default: 1,
        min: 0
    },
    delivered: {
        type: Boolean,
        default: false
    },
    orderDate: {
        type: Date,
        default: Date.now()
    },
    clientAddress: {
        state: {
            type: String,
            required: [true, 'Se debe seleccionar el departamento']
        },
        city: {
            type: String,
            required: [true,'Se debe selccionar la ciudad']
        },
        address: {
            type: String,
            required: [true, 'Se debe colocar la dirección']
        }     
    },
    phoneNumber: String
});

module.exports = model('Order', orderSchema);