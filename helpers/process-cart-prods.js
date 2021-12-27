const Product = require('../models/Product');
const Combo = require('../models/Combo');

const processProd = async (currentProd, index) => {
    const itemId = currentProd.productId;
    let item;
    let description = currentProd.description
    if (!currentProd.combo) {
        const descObject = typeof(description) === typeof('string') ? {desc: 'No description' } : JSON.parse(description);
        description = Object.values(descObject).join(', ');
        item = await Product.findById(itemId, 'name price');
        if (!item) {
            return false
        }
        item.description = description;
    } else {
        const descObject = JSON.parse(description);
        const products = Object.keys(descObject);
        for (let i = 0; i < products.length; i++) {
            const charecteristics = Object.values(descObject[products[i]]).join(', ');
            description += `${products[i]}: ${charecteristics}. `
        }
        item = await Combo.findById(itemId);
        if (!item) {
            return false
        }
        item.name = item.title
        item.description = description;
    }
    return item;
}

const findModel = async (prodId) => {
    try {
        const isProd = await Product.findById(prodId)
        if (isProd) {
            return 'Product'
        }
        const isCombo = await Combo.findById(prodId)
        if (isCombo) {
            return 'Combo'
        }
        return 'None'
    } catch (error) {
        
    }
}

module.exports = {
    processProd,
    findModel
}