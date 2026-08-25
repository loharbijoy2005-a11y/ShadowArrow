import React from 'react';
import HomeClient from '@/components/HomeClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const metadata = {
  title: 'SHADOW ARROW | Premium Streetwear & Techwear Store',
  description: 'Shop the latest oversized boxy-fit tees, heavy-weight 280-450 GSM French Terry hoodies, cargo pants, and cyber sneakers from SHADOW ARROW.',
};

async function getBanners() {
  try {
    const res = await fetch(`${API_URL}/api/v1/cms/banners`, {
      next: { revalidate: 30 }, // cache for 30s
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data && data.length > 0) {
      return data.map((b: any) => ({
        tag: 'SHADOW ARROW OFFICIAL',
        title: b.heading,
        desc: b.subtext || 'Exclusive streetwear drop engineered for ultimate style.',
        ctaText: 'Shop Now',
        ctaLink: b.target_link || '#catalog',
        image: b.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
      }));
    }
  } catch (err) {
    console.error('Failed to load banners on server:', err);
  }
  return [];
}

async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/api/v1/products?limit=20&page=1`, {
      next: { revalidate: 10 }, // cache for 10s
    });
    if (!res.ok) return { products: [], has_more: false };
    const data = await res.json();
    return {
      products: data.products || [],
      has_more: data.has_more || false,
    };
  } catch (err) {
    console.error('Failed to load products on server:', err);
  }
  return { products: [], has_more: false };
}

export default async function HomePage() {
  // Fetch data in parallel on the server side
  const [banners, productsData] = await Promise.all([
    getBanners(),
    getProducts(),
  ]);

  return (
    <HomeClient
      initialBanners={banners}
      initialProducts={productsData.products}
      initialHasMore={productsData.has_more}
    />
  );
}
