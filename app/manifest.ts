import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Domio',
    short_name: 'Domio',
    description: 'Alles-in-één vastgoedbeheerplatform voor vastgoedbeheerders, huurders en verhuurders',
    start_url: '/',
    display: 'standalone',
    background_color: '#002A1F',
    theme_color: '#002A1F',
    icons: [
      {
        src: '/images/offerla.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/offerla.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/offerla.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

