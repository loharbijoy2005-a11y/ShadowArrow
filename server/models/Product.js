import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userPhone: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  verifiedPurchase: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subtitle: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discountPercent: { type: Number, required: true },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  image: { type: String, required: true },
  galleryImages: { type: [String], default: [] },
  description: { type: String, required: true },
  highlights: { type: [String], default: [] },
  specs: { type: Map, of: String, default: {} },
  warranty: { type: String, default: '1 Year Official Warranty' },
  isPrime: { type: Boolean, default: true },
  isLightningDeal: { type: Boolean, default: true },
  isBestseller: { type: Boolean, default: false },
  stockCount: { type: Number, default: 10 },
  reviews: { type: [reviewSchema], default: [] }
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
