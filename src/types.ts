export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: 'gaming' | 'electronics' | 'fashion' | 'home';
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  isPrime: boolean;
  isLightningDeal?: boolean;
  isBestseller?: boolean;
  stockCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  name: string;
  phone: string;
  email: string;
  fullAddress?: string;
}

export interface Order {
  orderId: string;
  phone: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  paymentMethod: string;
  razorpayPaymentId: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  flatDiscount?: number;
  minOrderValue: number;
  description: string;
}
