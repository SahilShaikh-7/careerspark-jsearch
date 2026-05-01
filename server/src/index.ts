import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Load env vars from the root .env file
dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    const options = {
      amount, // amount in the smallest currency unit (paisa)
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send('Error creating order');
  }
});

app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    res.json({ message: "Payment verified successfully" });
  } else {
    res.status(400).json({ message: "Invalid Signature" });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
