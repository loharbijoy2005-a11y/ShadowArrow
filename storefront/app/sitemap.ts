import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shadowarrow.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/track-order',
    '/policies/faq',
    '/policies/privacy',
    '/policies/returns',
    '/policies/rewards',
    '/policies/shipping',
    '/policies/terms',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.6,
  }));

  let productRoutes: any[] = [];
  try {
    const res = await fetch(`${API_URL}/api/v1/products?limit=200`, {
      next: { revalidate: 3600 } // cache sitemap product fetch for 1 hour
    });
    if (res.ok) {
      const data = await res.json();
      const products = data.products || [];
      productRoutes = products.map((product: any) => {
        const prodId = product.id || product._id || product.slug;
        return {
          url: `${SITE_URL}/product/${prodId}`,
          lastModified: new Date(product.updated_at || product.createdAt || new Date()),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });
    }
  } catch (error) {
    console.error('Error generating sitemap dynamic routes:', error);
  }

  return [...staticRoutes, ...productRoutes];
}
