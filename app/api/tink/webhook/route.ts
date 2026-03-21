import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-tink-signature") ?? "";
  const secret = process.env.TINK_WEBHOOK_SECRET!;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  console.log("Tink webhook event:", event.event ?? event.type);
  console.log("Tink webhook payload:", JSON.stringify(event, null, 2));

  return new NextResponse("OK", { status: 200 });
}
