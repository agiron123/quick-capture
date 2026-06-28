import { auth } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

function notConfigured() {
  return new Response(JSON.stringify({ error: 'Neon Auth is not configured' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}

const handlers = auth?.handler();

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  if (!handlers) return notConfigured();
  return handlers.GET(request, context);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  if (!handlers) return notConfigured();
  return handlers.POST(request, context);
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  if (!handlers) return notConfigured();
  return handlers.PUT(request, context);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  if (!handlers) return notConfigured();
  return handlers.DELETE(request, context);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  if (!handlers) return notConfigured();
  return handlers.PATCH(request, context);
}
