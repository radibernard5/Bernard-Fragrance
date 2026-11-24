const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./config/db');
const { seedProductsIfEmpty } = require('./seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedProductsIfEmpty();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

if (require.main === module && !process.env.VERCEL) {
  startServer();
}

module.exports = app;
