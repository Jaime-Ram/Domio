import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95 dark:border-gray-800">
        <div className="container mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <Link href="/">
            <div className="py-2">
              <Logo width={150} height={40} />
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-[#002A1F] dark:text-gray-400 dark:hover:text-[#002A1F]"
          >
            Terug naar home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-12 text-4xl font-bold text-gray-900 dark:text-gray-100">
          Privacy Policies
        </h1>

        <div className="space-y-8">
          {/* Responsibility of Contributors */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Responsibility of Contributors
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus, donec nunc eros, ullamcorper id feugiat quisque aliquam sagittis. Sem turpis sed viverra massa gravida pharetra. Non dui dolor potenti eu dignissim fusce. Ultrices amet, in curabitur a arcu a lectus morbi id. Iaculis erat sagittis in tortor cursus. Molestie urna eu tortor, erat scelerisque eget. Nunc hendrerit sed interdum lacus. Lorem quis viverra sed
              </p>
              <p>
                pretium, aliquam sit. Praesent elementum magna amet, tincidunt eros, nibh in leo. Malesuada purus, lacus, at aliquam suspendisse tempus. Quis tempus amet, velit nascetur sollicitudin. At sollicitudin eget amet in. Eu velit nascetur sollicitudin erhdfvssfvrgss eget viverra nec elementum. Lacus, facilisis tristique lectus in.
              </p>
            </div>
          </section>

          {/* Gathering of Personal Information */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gathering of Personal Information
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus, donec nunc eros, ullamcorper id feugiat quisque aliquam sagittis. Sem turpis sed viverra massa gravida pharetra. Non dui dolor potenti eu dignissim fusce. Ultrices amet, in curabitur a arcu a lectus morbi id. Iaculis erat sagittis in tortor cursus. Molestie urna eu tortor, erat scelerisque eget. Nunc hendrerit sed interdum lacus. Lorem quis viverra sed
              </p>
            </div>
          </section>

          {/* Protection of Personal Information */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Protection of Personal- Information
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus, donec nunc eros, ullamcorper id feugiat quisque aliquam sagittis. Sem turpis sed viverra massa gravida pharetra. Non dui dolor potenti eu dignissim fusce. Ultrices amet, in curabitur a arcu a lectus morbi id. Iaculis erat sagittis in tortor cursus.
              </p>
              <p>
                Molestie urna eu tortor, erat scelerisque eget. Nunc hendrerit sed interdum lacus. Lorem quis viverra sed Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus, donec nunc eros, ullamcorper id feugiat
              </p>
            </div>
          </section>

          {/* Privacy Policy Changes */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Privacy Policy Changes
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus, donec nunc eros, ullamcorper id feugiat quisque aliquam sagittis. Sem turpis sed viverra massa gravida pharetra. Non dui dolor potenti eu dignissim fusce. Ultrices amet, in curabitur a arcu a lectus morbi id. Iaculis erat sagittis in tortor cursus. Molestie urna eu tortor, erat scelerisque eget. Nunc hendrerit sed interdum lacus. Lorem quis viverra sed
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}




