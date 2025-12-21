import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ConnectReauthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Re-authentication Required</CardTitle>
          <CardDescription>
            Please complete the account setup process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Your account setup session has expired. Please try connecting again.
          </p>
          <Button asChild className="w-full">
            <Link href="/connect">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}




