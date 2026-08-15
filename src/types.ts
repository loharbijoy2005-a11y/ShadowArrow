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
  galleryImages?: string[];
  description: string;
  highlights?: string[];
  specs?: Record<string, string>;
  warranty?: string;
  gstRate?: number;
  hsnCode?: string;
  isPrime: boolean;
  isLightningDeal?: boolean;
  isBestseller?: boolean;
  stockCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SavedAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface User {
  name: string;
  phone: string;
  email: string;
  fullAddress?: string;
  savedAddresses?: SavedAddress[];
}

export interface Order {
  orderId: string;
  phone: string;
  name: string;
  email?: string;
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
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  shiprocketOrderId?: string | number;
  shipmentId?: string | number;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  flatDiscount?: number;
  minOrderValue: number;
  description: string;
}
