import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://jukely.fr'
  return [
    { url: `${base}/fr`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/fr/modules`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/fr/pricing`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/fr/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/fr/contact`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}
