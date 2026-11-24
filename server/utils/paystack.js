const axios = require('axios');
const crypto = require('crypto');

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

const initializeTransaction = async ({ email, amount, reference, metadata, callback_url }) => {
  const response = await paystack.post('/transaction/initialize', {
    email,
    amount,
    reference,
    currency: 'GHS',
    metadata,
    callback_url,
  });
  return response.data;
};

const verifyTransaction = async (reference) => {
  const response = await paystack.get(`/transaction/verify/${encodeURIComponent(reference)}`);
  return response.data;
};

const verifyWebhookSignature = (req) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest('hex');
  return hash === req.headers['x-paystack-signature'];
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
  verifyWebhookSignature,
};
