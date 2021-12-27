const { response } = require("express");
const fetch = require('node-fetch');

const User = require("../models/User");
const Order = require("../models/Order");

const { createCustomError } = require("../errors/curstom-error");
const asyncWrapper = require("../middlewares/async");
const {processProd, findModel} = require("../helpers/process-cart-prods");
// SDK de Mercado Pago
const mercadopago = require("mercadopago");

// Agrega credenciales
mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN_MERCADOPAGO_DEVELOPMENT,
});

exports.getOrders = asyncWrapper(async (req, res = response, next) => {
  const orders = await Order.find({});

  if (!orders.length) {
    return next(createCustomError("No se encontraron ordenes", 404));
  }
  res.json({
    ok: true,
    orders,
  });
});

exports.getSingleOrder = asyncWrapper(async (req, res = response, next) => {
  const { email, orderNumber } = req.query;
  const queryObject = {};
  if (email) {
    const user = await User.find({ email }, "_id");
    if (!user.length)
      return next(createCustomError("No orders with that email", 404));
    queryObject.userId = user;
  }
  if (orderNumber) queryObject.orderNumber = orderNumber;
  const orders = await Order.find(queryObject, '-userId -payment -delivered').populate({
    path: 'cart.onModel',
    populate: {
      path: 'product'
    }
  })

  if (!orders.length) {
    return next(createCustomError("Order no encontrada...", 404));
  }

  res.json({
    ok: true,
    orders,
    hits: orders.length,
  });
});

exports.postOrder = asyncWrapper(async (req, res = response, next) => {
  const { cartData, userData } = req.body;
  /* cartData = {                                       userData = {
        products: {prodId, characterist, qty}[],    /=\    email, phoneNumber,
        totalValue: product                                 state, city, zip, address
        }                                                  }
    */
  if (!cartData || !userData) {
    return res.status(400).json({
      ok: false,
      msg: "No order in the request body",
    });
  }

  // search in the db for the product in the cart for check name and price;
  // Note: this algo is O(n^2) currently n max is 10 products.
  let items = [];
  // add each product of the order
  for (let i = 0; i < cartData.products.length; i++) {
    const currentProd = await processProd(cartData.products[i]);
    if (!currentProd) {
      return next(
        createCustomError(
          "The product in the order was not found in the DataBase",
          404
        )
      );
    }
    const { name, price, description } = currentProd;
    const productItemObject = {
      id: currentProd._id,
      title: name,
      unit_price: price,
      quantity: cartData.products[i].quantity,
      description: description,
    };
    items.push(productItemObject);
  }
  // Crea un objeto de preferencia
  let preference = {
    items: items,
    payer: {
      phone: { area_code: "+57", number: +userData.phoneNumber },
      address: { zip_code: userData.zip_code, street_name: userData.address },
      email: userData.email,
      total_amount: cartData.totalValue
    },
    back_urls: {
      success: `${process.env.HOST_URI}/api/shop/order-process`,
      failure: `${process.env.HOST_URI}/api/shop/order-process`,
      pending: `${process.env.HOST_URI}/api/shop/order-process`,
    },
    auto_return: "approved",
    shipments: {
      receiver_address: {
        zip_code: userData.zip_code,
        state: userData.state,
        city: userData.city,
        street_name: userData.address,
        extra: userData.addressExtraInfo,
      },
    },
  };
  const response = await mercadopago.preferences.create(preference);
  const init_point = response.body.init_point;

  res.json({
    ok: true,
    init_point,
  });
});

exports.orderFinish = async (req, res = response) => {
  const { collection_status, preference_id, payment_id } = req.query;
  console.log(req.query)
  const responsedata = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`,
  {
    method: 'GET',
    headers: {
      'Content-Type':'application/json',
      Authorization: `Bearer ${process.env.ACCESS_TOKEN_MERCADOPAGO_DEVELOPMENT}`
    }
  }
  )
  console.log(responsedata.json())
  // if (!additional_info) {
  //   return createCustomError('Problema con el pago en el servidor', 404)
  // }

  //  // create client if does not exist with the request info
  //  const existClient = await User.findOne({ email: additional_info.payer.email });
  //  const cartdb = []
  //  for (let i = 0; i < additional_info.items.length; i++) {
  //    let onModel = await findModel(additional_info.items[i].id)
  //    if (onModel === 'None') {
  //     throw new Error('One product in the cart was not found')
  //    }
  //    let cartdbObject = {
  //      product: additional_info.items[i].id, 
  //      quantity: additional_info.items[i].quantity,
  //      onModel
  //     }
  //     cartdb.push(cartdbObject)
  //  }
  //  if (existClient) {
  //    // create order in my DataBase
  //    const newOrder = await Order.create({
  //      userId: existClient._id,
  //      cart: cartdb,
  //      totalPrice: additional_info.payer.total_amount,
  //      orderId: payment_id,
  //      shippingAddress: {
  //        zip_code: additional_info.shipments.receiver_address.zip_code,
  //        state: additional_info.shipments.receiver_address.state,
  //        city: additional_info.shipments.receiver_address.city,
  //        address: additional_info.shipments.receiver_address.address,
  //        addressExtraInfo: additional_info.shipments.receiver_address.extra,
  //      },
  //    });
  //    existClient.orders.push(newOrder._id);
  //    existClient.save();
  //  } else {
  //    const newUser = await User.create({ email: userData.email });
  //    const newOrder = await Order.create({
  //      userId: newUser._id,
  //      cart: cartdb,
  //      totalPrice: additional_info.payer.total_amount,
  //      orderId: payment_id,
  //      shippingAddress: {
  //       zip_code: additional_info.shipments.receiver_address.zip_code,
  //       state: additional_info.shipments.receiver_address.state,
  //       city: additional_info.shipments.receiver_address.city,
  //       address: additional_info.shipments.receiver_address.address,
  //       addressExtraInfo: additional_info.shipments.receiver_address.extra,
  //      },
  //    });
  //    newUser.orders.push(newOrder._id);
  //    newUser.save();
  //  }

  // res.status(200).json({
  //   ok: true,
  //   payment_id
  // })
}
