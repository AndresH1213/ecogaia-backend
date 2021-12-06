const { response } = require("express");
const User = require('../models/User');
const Product = require('../models/Product');
// SDK de Mercado Pago
const mercadopago = require ('mercadopago');

// Agrega credenciales
mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN_MERCADOPAGO_DEVELOPMENT
});

exports.saveClient = (req, res = response) => {
    const { email, cart, order } = req.body;
    const client =  new User({email, cart, order});
    
    res.json({
        client
    })
}

exports.getOrders = (req, res = response) => {
    res.json('get order route');
}

exports.postOrder = async (req, res = response) => {
    const { cartData, userData } = req.body;
    /* cartData = {                                       userData = {
        products: { productId, characteristics },    /=\    email, phoneNumber,
        totalValue: product                                 state, city, address
    }                                                     }
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
            address: { zip_code: '', street_name: userData.address},
            email: userData.email,
            date_created: Date.now()
        }
    };    
    mercadopago.preferences.create(preference)
    .then(function(response){
        console.log(response.body)
        res.json({
            ok: true,
            preferenceId: response.body.id,
            init_point: response.body.init_point
        })
    }).catch(function(error){
        console.log(error);
    });

}
