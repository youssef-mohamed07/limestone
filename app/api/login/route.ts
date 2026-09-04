import { NextResponse } from 'next/server';
import {
  getPasswordSessionToken,
  VERCEL_SESSION_COOKIE,
} from '../../chatgpt-auth';

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get('password') ?? '').trim();
  const returnToValue = String(form.get('return_to') ?? '/');
  const returnTo =
    returnToValue.startsWith('/') && !returnToValue.startsWith('//')
      ? returnToValue
      : '/';
  const expected = process.env.APP_PASSWORD?.trim();

  if (!expected) {
    return NextResponse.redirect(
      new URL(`/login?config=1&return_to=${encodeURIComponent(returnTo)}`, request.url),
      303,
    );
  }

  if (!constantTimeEqual(password, expected)) {
    return NextResponse.redirect(
      new URL(`/login?error=1&return_to=${encodeURIComponent(returnTo)}`, request.url),
      303,
    );
  }

  const session = await getPasswordSessionToken();
  if (!session)
    return NextResponse.json(
      { error: 'APP_PASSWORD is not configured' },
      { status: 503 },
    );

  const response = NextResponse.redirect(new URL(returnTo, request.url), 303);
  response.cookies.set(VERCEL_SESSION_COOKIE, session, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

function constantTimeEqual(left: string, right: string) {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) {
    difference |=
      (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}
