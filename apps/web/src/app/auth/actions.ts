'use server';

import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/server';

export async function signInWithEmail(formData: FormData) {
  if (!auth) {
    return { error: 'Auth is not configured' };
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const { error } = await auth.signIn.email({ email, password });
  if (error) {
    return { error: error.message ?? 'Sign in failed' };
  }

  redirect('/');
}

export async function signUpWithEmail(formData: FormData) {
  if (!auth) {
    return { error: 'Auth is not configured' };
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const { error } = await auth.signUp.email({
    email,
    password,
    name: name || email.split('@')[0] || 'User',
  });

  if (error) {
    return { error: error.message ?? 'Sign up failed' };
  }

  redirect('/');
}

export async function signInWithProvider(provider: 'google' | 'github') {
  if (!auth) {
    return { error: 'Auth is not configured' };
  }

  const { data, error } = await auth.signIn.social({
    provider,
    callbackURL: '/',
  });

  if (error) {
    return { error: error.message ?? 'Sign in failed' };
  }

  if (data?.url) {
    redirect(data.url);
  }

  return { error: 'Could not start OAuth flow' };
}

export async function signOutAction() {
  if (!auth) return;
  await auth.signOut();
  redirect('/auth/sign-in');
}
