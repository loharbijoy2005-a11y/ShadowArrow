import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subtitle: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discountPercent: { type: Number, required: true },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 500 },
  image: { type: String, required: true },
  description: { type: String, required: true },
  isPrime: { type: Boolean, default: true },
  isLightningDeal: { type: Boolean, default: true },
  isBestseller: { type: Boolean, default: false },
  stockCount: { type: Number, default: 10 }
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
