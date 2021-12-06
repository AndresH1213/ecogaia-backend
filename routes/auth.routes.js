const { Router } = require('express');

const { login, signup, renewToken } = require('../controllers/auth');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.post('/login', login);

// router.post('/signup', signup);

router.get('/renew', validateJWT ,renewToken);

module.exports = router;