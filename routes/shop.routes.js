const { Router } = require('express');
const { body } = require('express-validator');
const validateFields = require('../middlewares/validate-fields');

const router = Router();

const {
    getOrders,
    postOrder
 } = require('../controllers/shop');

// parent route --> api/shop/...

router.get('/orders', getOrders);

router.post('/order',[
    body("cartData.products", "No hay productos en la petición")
        .isArray({min: 1}),
    body("cartData.totalValue", "Falta el valor total del pedido")
        .not().isEmpty().isNumeric(),
    body("userData.email", "Se requiere un email correcto en la orden")
        .isEmail().normalizeEmail(),
    body("userData.phoneNumber", "Se necesita un número de contacto")
        .not().isEmpty(),
    body("userData.state", "Seleccionar un departamento correcto")
        .not().isEmpty().isLength({min: 4}).trim(),
    body("userData.city", "Seleccionar un municipio correcto")
        .not().isEmpty().isLength({min: 3}).trim(),
    body("userData.zip_code", "Insertar el código postal")
        .not().isEmpty().isLength({min: 4}).trim(),
    body("userData.address", "Se necesita una dirección para entrega")
        .not().isEmpty().trim()
    ,validateFields
],postOrder);

module.exports = router;