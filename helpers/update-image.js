const fs = require('fs');

const Product = require('../models/Product');
const Combo = require('../models/Combo');

const deleteImage = ( path ) => {
    if (fs.existsSync(path)) {
        // delete the old image
        fs.unlinkSync( path )
    }
}

exports.updateImage = async (type, uid, filename ) => {
    let oldPath = '';

    switch (type) {
        case 'product':
            const product = await Product.findById(uid);
            if (!product) {
                console.log('Product not found');
                return false;
            }

            const arrayImgs = product.imageUrl

            oldPath = `./uploads/product/${ arrayImgs[0] }`;
            deleteImage(oldPath);
            
            product.imageUrl.splice(0,1,filename)
            console.log(product.imageUrl)
            await product.save();
            
            return true;

        case 'combo':
            const combo = await Combo.findById(uid);
            if (!combo) {
                console.log('Combo not found!');
                return false
            }

            oldPath = `./uploads/users/${ combo.image }`;
            deleteImage(oldPath);

            combo.image = filename;
            await combo.save();
            
            return true
    
        default:
            break;
    }
}

exports.addImage = async (prodId, filename) => {

    const product = await Product.findById(prodId);
            if (!product) {
                console.log('Product not found');
                return false;
            }
            
            product.imageUrl.push(filename);
            await product.save();
            
            return true;
}