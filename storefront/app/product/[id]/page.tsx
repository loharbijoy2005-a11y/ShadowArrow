import React from 'react';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/ProductDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type Props = {
  params: { id: string };
};

// Fetch product details on server side
async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/${id}`, {
      next: { revalidate: 10 }, // cache for 10s
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error fetching product on server:', err);
    return null;
  }
}

// Fetch related products on server side
async function getRelatedProducts(category: string, id: string) {
  try {
    const res = await fetch(`${API_URL}/api/v1/products?category=${encodeURIComponent(category)}&limit=5`, {
      next: { revalidate: 10 }, // cache for 10s
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = data.products || [];
    return list.filter((p: any) => (p.id || p._id || p.slug) !== id).slice(0, 4);
  } catch (err) {
    console.error('Error fetching related products on server:', err);
    return [];
  }
}

// Dynamic SEO Metadata Generation for Products
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found | SHADOW ARROW',
      description: 'The requested streetwear or techwear item could not be found.',
    };
  }

  const title = `${product.title} | Premium ${product.category || 'Streetwear'}`;
  const description = product.description || `Official online store item: ${product.title}. Premium heavy GSM apparel & cyber techwear.`;
  const images = product.images && product.images.length > 0 ? product.images : ['/icon.jpg'];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: images.map((img: string) => ({
        url: img,
        alt: product.title,
      })),
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [images[0]],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const id = params.id;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white items-center justify-center space-y-4">
        <h1 className="text-2xl font-black font-mono">Product Not Found</h1>
        <p className="text-slate-400 text-sm">We couldn't retrieve the details for this item.</p>
        <a href="/" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs uppercase">
          Back to Shop
        </a>
      </div>
    );
  }

  const related = await getRelatedProducts(product.category || 'Apparel', id);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={related}
      id={id}
    />
  );
}
