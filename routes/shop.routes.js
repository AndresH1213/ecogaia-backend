const { Router } = require('express');

const router = Router();

const {
    getCart,
    saveCart,
    saveClient,
    getOrders,
    postOrder
 } = require('../controllers/shop');

// parent route --> api/shop/...

router.post('/client', saveClient )

router.get('/orders', getOrders);

router.post('/order', postOrder);

module.exports = router;