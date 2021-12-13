const { Router } = require('express');
const { body, query } = require('express-validator');
const validateFields = require('../middlewares/validate-fields');
const { validateADMIN, validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

const {
    getOrders,
    getSingleOrder,
    postOrder
 } = require('../controllers/shop');

// parent route --> api/shop/...

router.get('/orders', [validateJWT, validateADMIN] ,getOrders);

router.get('/order',[
    query('email').custom((value, {req, loc, path}) => {
        if ( !req.query.email && !req.query.orderNumber ) {
            throw new Error('Query params is missing')
        }
        return value
    }),
    validateFields
], getSingleOrder);

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