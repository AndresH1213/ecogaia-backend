const {  Router } = require('express');
const expressFileupload = require('express-fileupload');
const { body } = require('express-validator');

const { validateJWT, validateADMIN } = require('../middlewares/validate-jwt');
const validateFields = require('../middlewares/validate-fields');
const { setCombos, getCombos, singleCombo, removeCombo } = require('../controllers/combos');
const { fileUpload } = require('../controllers/products');

const router = Router();
router.use(expressFileupload());

router.post('/', [
    validateJWT, validateADMIN,
        body("title", "Título de minimo 4 carácteres y máximo 80")
            .notEmpty().isString().isLength({min: 4, max: 80}).trim(),
        body("price", "Se necesita un precio correcto").isNumeric(),
        body("products", "Deben colocar products").notEmpty()
    ,validateFields ], setCombos, fileUpload );

router.get('/one', singleCombo);

router.get('/', getCombos);

router.patch('/:id', [validateJWT, validateADMIN], removeCombo )

module.exports = router;