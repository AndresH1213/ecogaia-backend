const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Must provide a name'],
    },
    code: {
        type: String,
        required: [true, 'Must provide a code'],
    },
    imageUrl: {
        type: [String],
        required: true,
        default: 'no-img.png'
    },
    price: {
        type: Number,
        required: [true, 'Must provide a price']
    },
    characteristics: {
        type: Object,
        default: {}
    },
    availability: {
        type: Boolean,
        required: true,
        default: true,
    },
    createAt: {
        type: Date,
        default: Date.now(),
    }
});

productSchema.method('toJSON', function() {
    const { __v, createAt, ...object } = this.toObject();

    return object
})

module.exports = mongoose.model('Product', productSchema);