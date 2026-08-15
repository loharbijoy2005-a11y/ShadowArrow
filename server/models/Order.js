import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    name: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number
      }
    ],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, default: 'Shipped via Prime Express Air' },
    awbCode: { type: String, default: '' },
    courierName: { type: String, default: '' },
    trackingUrl: { type: String, default: '' },
    shiprocketOrderId: { type: String, default: '' },
    shipmentId: { type: String, default: '' },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    paymentMethod: { type: String, default: 'Online Payment (Razorpay)' },
    razorpayPaymentId: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  { strict: false, timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
