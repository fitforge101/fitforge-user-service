require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/user_db';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('[user-service] MongoDB connected'))
  .catch((err) => { 
    console.error('[user-service] MongoDB connection failed:', err.message);
    process.exit(1);
  });

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'user-service' }));
app.listen(PORT, () => console.log(`[user-service] Running on port ${PORT}`));
