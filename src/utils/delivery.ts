export const WAREHOUSE_PINCODE = '722157';
export const WAREHOUSE_LOCATION = 'Shadow Warehouse (Bishnupur Hub, WB - 722157)';

export interface DeliveryCalculation {
  warehousePin: string;
  destinationPin: string;
  deliveryFee: number;
  estimatedDays: string;
  shippingTier: string;
  isFreeDelivery: boolean;
}

/**
 * Calculates delivery fee and estimated delivery timeline relative to origin Warehouse Pincode 722157.
 * 
 * Rules:
 * - Local Zone (pincode 722157): Express 1 - 2 Days | FREE delivery
 * - State / Regional Zone (starts with 70, 71, 72, 73, 74 - West Bengal / East): Express 2 - 3 Days | ₹49 (FREE for orders >= ₹799)
 * - National Zone (Other 6-digit Indian pincodes): Express Air 3 - 5 Days | ₹69 (FREE for orders >= ₹999)
 * - Empty / Unspecified: Standard 3 - 4 Days Express | ₹69 (FREE for orders >= ₹999)
 */
export function calculateDeliveryInfo(destinationPin: string, subtotal: number): DeliveryCalculation {
  const cleanPin = (destinationPin || '').trim();

  // 1. Same local warehouse pincode
  if (cleanPin === WAREHOUSE_PINCODE) {
    return {
      warehousePin: WAREHOUSE_PINCODE,
      destinationPin: cleanPin,
      deliveryFee: 0,
      estimatedDays: '1 - 2 Days Express (Local Hub)',
      shippingTier: 'Local Warehouse Direct',
      isFreeDelivery: true
    };
  }

  // 2. Regional / West Bengal & Nearby (70xxxx to 74xxxx)
  if (/^7[0-4]\d{4}$/.test(cleanPin)) {
    const isFree = subtotal >= 799;
    return {
      warehousePin: WAREHOUSE_PINCODE,
      destinationPin: cleanPin,
      deliveryFee: isFree ? 0 : 49,
      estimatedDays: '2 - 3 Days Express',
      shippingTier: 'Regional Express Ground',
      isFreeDelivery: isFree
    };
  }

  // 3. Rest of India (Other valid 6 digit pincodes)
  if (/^\d{6}$/.test(cleanPin)) {
    const isFree = subtotal >= 999;
    return {
      warehousePin: WAREHOUSE_PINCODE,
      destinationPin: cleanPin,
      deliveryFee: isFree ? 0 : 69,
      estimatedDays: '3 - 5 Days Express Air',
      shippingTier: 'National Prime Air',
      isFreeDelivery: isFree
    };
  }

  // 4. Default fallback when no pin entered yet
  const isFreeDefault = subtotal >= 999;
  return {
    warehousePin: WAREHOUSE_PINCODE,
    destinationPin: cleanPin,
    deliveryFee: isFreeDefault ? 0 : 69,
    estimatedDays: '3 - 4 Days Express Delivery',
    shippingTier: 'Standard Warehouse Delivery',
    isFreeDelivery: isFreeDefault
  };
}
