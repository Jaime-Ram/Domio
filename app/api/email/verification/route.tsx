import { NextRequest, NextResponse } from 'next/server';
import EmailVerification from '@/emails/email-verification';
import { render } from '@react-email/render';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userName = searchParams.get('userName') || 'Gebruiker';
  const verificationUrl = searchParams.get('verificationUrl') || '#';

  const emailHtml = render(
    EmailVerification({
      userName,
      verificationUrl,
    })
  );

  return new NextResponse(emailHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}




