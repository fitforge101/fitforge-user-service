const express = require('express');
const userRoutes = require('./routes/user');

const app = express();
app.use(express.json());

app.use('/users', userRoutes);
app.get('/health', (req, res) => res.json({ status: 'OK', service: 'user-service' }));

module.exports = app;
