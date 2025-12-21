import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function EnvSetupPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Environment Setup Required</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Missing Environment Variables</CardTitle>
            <CardDescription>
              Your application needs Supabase and Stripe credentials to function properly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Create .env.local file</h3>
              <p className="text-sm text-muted-foreground mb-2">
                A template file has been created at the root of your project. Open it and add your credentials.
              </p>
              <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                .env.local
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Get Supabase Credentials</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary underline">Supabase Dashboard</a></li>
                <li>Create a new project or select an existing one</li>
                <li>Navigate to Settings → API</li>
                <li>Copy the Project URL and anon/public key</li>
                <li>Add them to your .env.local file</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Get Stripe Credentials</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe Dashboard</a></li>
                <li>Navigate to Developers → API keys</li>
                <li>Copy your Publishable key and Secret key</li>
                <li>For webhooks: Go to Developers → Webhooks and create an endpoint</li>
                <li>Add all keys to your .env.local file</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Restart Development Server</h3>
              <p className="text-sm text-muted-foreground">
                After updating .env.local, restart your development server:
              </p>
              <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm mt-2">
                npm run dev
              </code>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Example .env.local format:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...`}
              </pre>
            </div>

            <div className="pt-4">
              <Link href="/">
                <button className="text-primary hover:underline text-sm">
                  ← Return to Home
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}




