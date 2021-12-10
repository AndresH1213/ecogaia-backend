const { response } = require("express");
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

const asyncWrapper = require('../middlewares/async');
// SDK de Mercado Pago
const mercadopago = require ('mercadopago');

// Agrega credenciales
mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN_MERCADOPAGO_DEVELOPMENT
});

exports.saveClient = async (req, res = response) => {
    const { email, cart, order } = req.body;
    const client =  await User.create({email, cart, order});
    
    res.json({
        client
    })
}

exports.getOrders = (req, res = response) => {
    res.json('get order route');
}

exports.postOrder = asyncWrapper( async (req, res = response) => {
    const { cartData, userData } = req.body;
    /* cartData = {                                       userData = {
        products: { prodId, characterist, qty },    /=\    email, phoneNumber,
        totalValue: product                                 state, city, zip, address
        }                                                  }
    */
    if (!cartData || !userData) {
        return res.status(400).json({
            ok: false,
            msg: 'No order in the request body'
        })
    };

    // search in the db for the product in the cart for check name and price;
    // Note: this algo is O(n^2) currently n max is 10 products.
    const prodIds = cartData.products.map(product => product.productId);
    const products = await Product.find({"_id": {"$in": prodIds}}, 'name price').all();
    let items = [];
    // add each product of the order
    for (let i = 0; i < prodIds.length; i++) {
        const {name, price} = products.filter(prod => prod._id.toString() === prodIds[i].toString())[0]
        if (!name || !price) {
            return res.status(404).json({
                ok: false,
                msg: `The product ${prodIds[i]} was not found in the db`
            })
        }
        const productItemObject = {
            id: prodIds[i],
            title: name,
            unit_price: price,
            quantity: cartData.products[i].quantity,
            description: cartData.products[i].description
        }
        items.push(productItemObject)
    }

    // Crea un objeto de preferencia
    let preference = {
        items: items,
        payer: {
            phone: { area_code: '+57', number: +userData.phoneNumber },
            address: { zip_code: userData.zip_code, street_name: userData.address},
            email: userData.email,
            date_created: Date.now()
        },
        back_urls: {
            success: 'http://localhost:4200',
            failure: 'http://localhost:4200/products',
            pending: 'http://localhost:4200'
        },
        auto_return: 'approved',
        shipments: {
            receiver_address: {
                zip_code: userData.zip_code,
                street_name: userData.address
            }
        }
    };    
    const response = await mercadopago.preferences.create(preference)
    const init_point = response.init_point
    // create client if does not exist with the request info
    const existClient = await User.findOne({email: userData.email});
    const cartdb = cartData.products.map(product => ({product: product.productId, quantity: product.quantity}))
    if (existClient) {
        // create order in my DataBase
        const newOrder = await Order.create({
            userId: existClient._id,
            cart: cartdb,
            totalPrice: cartData.totalValue,
            shippingAddress: {
                zip_code: userData.zip_code,
                state: userData.state,
                city: userData.city,
                address: userData.address,
                addressExtraInfo: userData.addressExtraInfo
            }
        })
        existClient.orders.push(newOrder._id);
        existClient.save();
    } else {
        const newUser = await User.create({email: userData.email});
        const newOrder = await Order.create({
            userId: newUser._id,
            cart: cartdb,
            totalPrice: cartData.totalValue,
            shippingAddress: {
                zip_code: userData.zip_code,
                state: userData.state,
                city: userData.city,
                address: userData.address,
                addressExtraInfo: userData.addressExtraInfo
            }
        });
        newUser.orders.push(newOrder._id);
        newUser.save()
    }
    res.send('ok boy')

    // res.redirect(init_point)
})
