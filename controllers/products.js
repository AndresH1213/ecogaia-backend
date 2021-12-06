const fs = require('fs');
const path = require('path');
const { response } = require('express');

const { updateImage, addImage } = require('../helpers/update-image');

const Product = require('../models/Product');
const { processImage } = require('../helpers/process-image');

exports.getProducts = async (req, res = response) => {
    const [products, total] = await Promise.all([
        Product.find(),
        Product.countDocuments(), 
    ]) 
    res.json({
        ok: true,
        products,
        total
    })
};

exports.getSingleProduct = async (req, res = response) => {
    const { id, code} = req.query;
    const queryObject = {};
    if (id) {
        queryObject._id = id;
    }
    if (code) {
        queryObject.code = code;
    }
    try {
        const product = await Product.findOne(queryObject);
        if (!product) {
            return res.status(404).json({
                ok: false,
                msg: 'There is any product with that query param'
            })
        };
        res.status(200).json({
            ok: true,
            product
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Product not found'
        })
    }
};

exports.fileUpload = (req, res = response) => {
    // TODO: Implement when load an image just by the URL and not file
    let type = req.params.type;
    let uid = req.params.id;
    let forUpdate = req.body.update;

    if (req.result) {
        uid = req.result._id;
        type = 'combo';
        forUpdate = true
    }
    
    // validate file exist
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            msg: 'There is no files uploaded'
        });
    }

    const typesAllowed = ['combo','product'];
    
    if (!typesAllowed.includes(type)) {
        return res.status(400).json({
            ok: false,
            msg: 'The type selected should be combo or product'
        });
    }

    // processing the image...
    const file = req.files.image;
    
    const [path, filename] = processImage(file, type);

    if (!path) {
        return res.status(400).json({
            ok: false,
            msg: 'The extension is not allowed'
        });
    }

    // move the image;
    file.mv(path, function(err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error saving the image in the server'
            });
        }

        // updated database
        if (forUpdate) {
            updateImage(type, uid, filename);
            return res.json({
                ok: true,
                msg: 'Image updated',
                filename
            })
        } else {
            addImage( uid, filename);
            return res.json({
                ok: true,
                msg: 'File uploaded',
                filename
            })
        }

    });
}

exports.retrieveImage = (req, res = response) => {
    const type = req.params.type

    const photo = req.params.photo;

    const pathImg = path.join(__dirname, `../uploads/${type}/${photo}`);

    // default image
    if (fs.existsSync(pathImg)){
        res.sendFile(pathImg);
    } else {
        const pathDefault = path.join(__dirname, '../uploads/no-img.png');
        res.sendFile(pathDefault);
    }
}

exports.createProduct = async (req, res = response) => {
    const { name, code, price, characteristics} = req.body;
    let { imageUrl } = req.body;
    let file;
    let characteristicsObject;
    if (characteristics) {
        characteristicsObject = JSON.parse(characteristics)
    }
    if (req.files && !imageUrl) {
        file = req.files.imageUrl || '';

        const [path, filename] = processImage(file, 'product')

        if (!path || !filename) {
            return res.status(400).json({
                ok: false,
                msg: 'The extension is not allowed'
            });
        }
        
        imageUrl = filename
    }

    try {
        const newProduct = new Product({
            name,
            code,
            imageUrl,
            price,
            characteristics: characteristicsObject
        });
        await newProduct.save();

        // saving the imageFile
        if (file) {
            file.mv(`./uploads/product/${imageUrl}`, function(err) {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error saving the image in the server'
                    });
                }        
            });
        }

        res.json({
            ok: true,
            newProduct,
            user: req.user
        });
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'The product can not be created'
        })
    }

};

exports.updateProduct = async (req, res = response) => {
    const productId = req.params.id;
    
    try {
        const productDB = await Product.findById(productId);

        if (!productDB) {
            return res.status(404).json({
                ok: false,
                msg: 'There is any product with that id'
            })
        }

        //Images array manipulation, when no url is send delete the last image, then the
        // url is already in the array do nothing, and if is different add it
        const imagesDB = productDB.imageUrl;
        if (!req.body.imageUrl) {
            imagesDB.pop();
            req.body.imageUrl = imagesDB;
        } else if (imagesDB.includes(req.body.imageUrl)) {
            req.body.imageUrl = imagesDB;
        } else {
            imagesDB.push(req.body.imageUrl);
            req.body.imageUrl = imagesDB;
        }

        // Parse the characteristic object
        if ( req.body.characteristics ){
            req.body.characteristics = JSON.parse(req.body.characteristics)
        }

        //update the product

        const productUpdated = await Product.findByIdAndUpdate({_id: productId}, req.body, {new:true});

        res.json({
            ok: true,
            msg: 'The product was updated with success',
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Please comunicate with the administrator'
        });
    }
};

exports.deleteProduct = async (req, res = response) => {
    
    const productId = req.params.id;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                ok: false,
                msg: 'There is any product with that id'
            })
        };
        await Product.findByIdAndDelete(productId);
        res.json({
            ok: true,
            msg: 'Product Deleted'
        })
    } catch (error) {
       console.log(error);
       res.status(500).json({
           ok: false,
           msg: 'Please comunicate with the administrator'
       }) 
    }
}


