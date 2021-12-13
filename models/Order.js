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
            refPath: 'cart.onModel'
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        },
        onModel: {
            type: String,
            required: true,
            enum: ['Product', 'Combo']
        },
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
    orderNumber: {
        type: String,
        default: 'Unprocess'
    },
    payment: {
        type: Boolean,
        default: false
    },
    orderDate: {
        type: Date,
        default: Date.now()
    },
    shippingAddress: {
        zip_code: {
            type: String,
            required: [true, 'zipcode missing']
        },
        state: {
            type: String,
            required: [true, 'state is required']
        },
        city: {
            type: String,
            required: [true,'city required']
        },
        address: {
            type: String,
            required: [true, 'adress for shipping']
        },
        addressExtraInfo: String
    },
    phoneNumber: String
});

module.exports = model('Order', orderSchema);