const express = require('express');
const app = express();

const productRoutes = require('./routes/products.routes')

// routes
app.use('/api/products', productRoutes)

const port = 3000 || process.env.PORT;

app.listen(port, console.log(`Server listen in port ${port}...`))