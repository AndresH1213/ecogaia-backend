const { Router } = require('express');
const expressFileupload = require('express-fileupload');
const { body } = require('express-validator');
const { getProducts, 
        createProduct,  
        getSingleProduct,
        updateProduct,
        deleteProduct,
        // image
        fileUpload,
        retrieveImage} = require('../controllers/products');

const { validateJWT, validateADMIN} = require('../middlewares/validate-jwt');
const validateFields = require('../middlewares/validate-fields');
const router = Router();

router.use(expressFileupload());

// parent route --> api/products/...

router.post('/', [
  validateJWT, validateADMIN,
        body("name", 'El nombre es requerido')
                .isString().not().isEmpty().trim().isLength({min: 3}),           
        body("code", "El código es requerido")
                .isString().not().isEmpty().trim().isLength({min: 3}),
        body("price", "El precio es requerido")
                .isNumeric()           
  ,validateFields
], createProduct);

router.get('/all', getProducts);

router.get('/', getSingleProduct);

router.get('/image/:type/:photo', retrieveImage);

router.put('/image/:type/:id', [validateJWT, validateADMIN], fileUpload);

router.put('/:id', [validateJWT, validateADMIN], updateProduct);

router.delete('/:id', [validateJWT, validateADMIN], deleteProduct);

module.exports = router;