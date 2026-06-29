'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useActionState } from 'react';

import { signInWithEmail } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const searchParams = useSearchParams();
  const configError = searchParams.get('error') === 'auth-not-configured';
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => signInWithEmail(formData),
    null
  );

  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Quick Capture</CardTitle>
          <CardDescription>Access your todos from the web companion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configError ? (
            <p className="text-sm text-destructive">
              Neon Auth is not configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.
            </p>
          ) : null}
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

          <form action={formAction} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!authClient}
              onClick={() =>
                void authClient?.signIn.social({ provider: 'google', callbackURL: '/' })
              }
            >
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!authClient}
              onClick={() =>
                void authClient?.signIn.social({ provider: 'github', callbackURL: '/' })
              }
            >
              Continue with GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link href="/auth/sign-up" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
