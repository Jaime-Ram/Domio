import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ConnectSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Connected Successfully!</CardTitle>
          <CardDescription>
            Your Stripe account has been connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            You can now receive payments and pay your team members through
            Stripe.
          </p>
          <Button asChild className="w-full">
            <Link href="/connect">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}




