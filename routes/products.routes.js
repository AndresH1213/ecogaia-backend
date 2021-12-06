const { Router } = require('express');
const expressFileupload = require('express-fileupload');

const { getProducts, 
        createProduct,  
        getSingleProduct,
        updateProduct,
        deleteProduct,
        // image
        fileUpload,
        retrieveImage} = require('../controllers/products');

const { validateJWT, validateADMIN} = require('../middlewares/validate-jwt');

const router = Router();

router.use(expressFileupload());

// parent route --> api/products/...

router.post('/', [validateJWT, validateADMIN], createProduct);

router.get('/all', getProducts);

router.get('/', getSingleProduct);

router.get('/image/:type/:photo', retrieveImage);

router.put('/image/:type/:id', [validateJWT, validateADMIN], fileUpload);

router.put('/:id', [validateJWT, validateADMIN], updateProduct);

router.delete('/:id', [validateJWT, validateADMIN], deleteProduct);

module.exports = router;