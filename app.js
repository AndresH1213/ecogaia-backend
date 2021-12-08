require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./db/connect');
const app = express();

const notFound = require('./middlewares/not-found');

// routes import
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const combosRoutes = require('./routes/combos.routes');
const shopRoutes = require('./routes/shop.routes');

// CORS Config
app.use(cors());

// middlewares
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/combos', combosRoutes);
app.use('/api/shop', shopRoutes);

app.use(notFound);

const port = 3000 || process.env.PORT;

const start = async () => {
    try {
        // connect to DB
        await connectDB(process.env.MONGO_URI);
        app.listen(port, console.log(`Server listen in port ${port}...`))
        
    } catch(err) {
        console.log(err)
        console.log('Ocurrio un error por favor comuniquese con el administrador')
    }
};

start();
