const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: [String],
        required: true,
        default: 'no-img.png'
    },
    price: {
        type: Number,
        required: true
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