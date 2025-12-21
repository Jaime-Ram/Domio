import { NextRequest, NextResponse } from 'next/server';
import EmailVerification from '@/emails/email-verification';
import { render } from '@react-email/render';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userName = searchParams.get('userName') || 'Gebruiker';
    const verificationUrl = searchParams.get('verificationUrl') || '#';

    const emailHtml = await render(
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
  } catch (error) {
    console.error('Error rendering email template:', error);
    return new NextResponse('Error rendering email template', { status: 500 });
  }
}

