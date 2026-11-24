const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'Bernard Noir Intense',
    price: 145,
    description:
      'A bold masculine fragrance with bergamot, warm woods, and amber for a confident, long-lasting signature scent.',
    imageUrl:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80',
    category: 'Men',
    stock: 25,
    isAvailable: true,
  },
  {
    name: 'Bernard Velvet Rose',
    price: 135,
    description:
      'An elegant floral perfume blending rose, soft musk, and creamy vanilla for a refined feminine finish.',
    imageUrl:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
    category: 'Women',
    stock: 20,
    isAvailable: true,
  },
  {
    name: 'Bernard Citrus Accord',
    price: 98,
    description:
      'A fresh unisex scent with bright citrus, neroli, and clean musk—perfect for everyday wear in Ghana’s warm climate.',
    imageUrl:
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80',
    category: 'Unisex',
    stock: 30,
    isAvailable: true,
  },
  {
    name: 'Bernard Oud Royale',
    price: 180,
    description:
      'A luxurious unisex oud fragrance with saffron, resin, and deep woods for an opulent evening presence.',
    imageUrl:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80',
    category: 'Unisex',
    stock: 12,
    isAvailable: true,
  },
  {
    name: 'Bernard Amber Bloom',
    price: 120,
    description:
      'A warm feminine blend of jasmine, amber, and sandalwood that feels smooth, radiant, and memorable.',
    imageUrl:
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=80',
    category: 'Women',
    stock: 18,
    isAvailable: true,
  },
  {
    name: 'Bernard Cedar Fresh',
    price: 110,
    description:
      'A crisp men’s fragrance featuring cedarwood, grapefruit, and vetiver with a clean, modern character.',
    imageUrl:
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80',
    category: 'Men',
    stock: 22,
    isAvailable: true,
  },
];

async function seedProductsIfEmpty() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(sampleProducts);
    console.log(`Seeded ${sampleProducts.length} sample Bernard Fragrance perfumes.`);
    return { seeded: true, count: sampleProducts.length };
  }
  return { seeded: false, count };
}

async function runSeedScript() {
  try {
    await connectDB();
    const result = await seedProductsIfEmpty();
    if (!result.seeded) {
      console.log(`Database already has ${result.count} product(s). No sample products added.`);
    }
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeedScript();
}

module.exports = { seedProductsIfEmpty, sampleProducts };
