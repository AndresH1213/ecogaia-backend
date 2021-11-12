const { response } = require('express');

exports.getProducts = (req, res = response) => {
    res.send('hola mundo')
}