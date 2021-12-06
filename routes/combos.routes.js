const {  Router } = require('express');
const expressFileupload = require('express-fileupload');
const router = Router();

router.use(expressFileupload());

const { validateJWT, validateADMIN } = require('../middlewares/validate-jwt');
const { setCombos, getCombos, removeCombo } = require('../controllers/combos');
const { fileUpload } = require('../controllers/products');

router.post('/', [validateJWT, setCombos], fileUpload );

router.get('/:id', getCombos);

router.delete('/:id', [validateJWT, validateADMIN], removeCombo )

module.exports = router;