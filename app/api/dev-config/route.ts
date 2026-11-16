import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Indisponível.' }, { status: 404 });
  }

  const apiKey = process.env.DEV_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: 'Sem chave local.' }, { status: 404 });
  }

  return NextResponse.json({
    apiKey,
    model: process.env.DEV_API_MODEL?.trim() || 'gemini-flash-latest',
    baseURL:
      process.env.DEV_API_BASE_URL?.trim() ||
      'https://generativelanguage.googleapis.com/v1beta/openai/',
  });
}
