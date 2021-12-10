const { CustomAPIError} = require('../errors/curstom-error')

const errorHandlerMiddleware = (err, req, res, next) => {
    if (err instanceof CustomAPIError) {
      return res.status(err.statusCode).json({
          ok: false,
          msg: err.message
      })
    }
    return res.status(500).json({
        ok: false,
        msg: 'Ocurrió un error comuniquese con el administrador',
        error: err.message
    })
}

module.exports = errorHandlerMiddleware