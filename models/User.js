const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    role: {
        type: String,
        default: "CLIENT"
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
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    createAt: {
        type: Date,
        default: Date.now()
    }
});

userSchema.method('toJSON', function() {
    const { _v, _id, createAt, password, ...object } = this.toObject();
    object.uid = _id
    return object
})

module.exports = model('User', userSchema);