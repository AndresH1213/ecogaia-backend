const { response } = require("express");
const User = require("../models/User");
const Order = require("../models/Order");

const { createCustomError } = require("../errors/curstom-error");
const asyncWrapper = require("../middlewares/async");
const processProd = require("../helpers/process-cart-prods");
// SDK de Mercado Pago
const mercadopago = require("mercadopago");
const Product = require("../models/Product");
const Combo = require("../models/Combo");

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
        products: { prodId, characterist, qty },    /=\    email, phoneNumber,
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
      date_created: Date.now(),
    },
    back_urls: {
      success: "http://localhost:4200/success",
      failure: "http://localhost:4200/failure",
      pending: "http://localhost:4200",
    },
    auto_return: "approved",
    shipments: {
      receiver_address: {
        zip_code: userData.zip_code,
        street_name: userData.address,
      },
    },
  };
  const response = await mercadopago.preferences.create(preference);
  const init_point = response.body.init_point;
  // create client if does not exist with the request info
  const existClient = await User.findOne({ email: userData.email });
  const cartdb = cartData.products.map((product) => {
    let onModel = "Product";
    if (product.combo) {
      onModel = "Combo";
    }
    return { product: product.productId, quantity: product.quantity, onModel };
  });
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
        addressExtraInfo: userData.addressExtraInfo,
      },
    });
    existClient.orders.push(newOrder._id);
    existClient.save();
  } else {
    const newUser = await User.create({ email: userData.email });
    const newOrder = await Order.create({
      userId: newUser._id,
      cart: cartdb,
      totalPrice: cartData.totalValue,
      shippingAddress: {
        zip_code: userData.zip_code,
        state: userData.state,
        city: userData.city,
        address: userData.address,
        addressExtraInfo: userData.addressExtraInfo,
      },
    });
    newUser.orders.push(newOrder._id);
    newUser.save();
  }

  res.json({
    ok: true,
    init_point,
  });
});
