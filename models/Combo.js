const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ComboSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    products: [
        {type: Schema.Types.ObjectId, ref: 'Product', required: true}
    ],
    image: {
        type: String,
        default: './uploads/combo/no-image.jpg'
    },
    price: {
        type: Number,
        required: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    createAt: {
        type: Date,
        default: Date.now()
    }
});

ComboSchema.method('toJSON', function() {
    const { __v, createAt, availability, ...object } = this.toObject();

    return object
});

module.exports = mongoose.model('Combo', ComboSchema);