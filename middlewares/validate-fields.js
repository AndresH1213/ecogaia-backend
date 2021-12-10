const { response } = require('express');
const { validationResult } = require('express-validator');
const { createCustomError } = require('../errors/curstom-error')

const validateFields = (req, res = response, next) => {
    const errors = validationResult( req );

    if ( !errors.isEmpty() ) {
        const errorObject = errors.mapped();
        const firstError = Object.keys(errorObject)[0]
        const errorMsg = `Error de validación - ${errorObject[firstError].msg}`
        return next(createCustomError(errorMsg, 400));
    }

    next();
};

module.exports = validateFields