import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * POST /api/stakeholder/form/[token]/identify
 * Set the stakeholder's name and optional email on the token.
 * Token-based auth — no session required.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token: tokenString } = await params;
    const limited = await checkRateLimit(tokenString);
    if (limited) return limited;
    const body = await request.json();

    const { name, email } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return Response.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const token = await prisma.stakeholderAccessToken.findUnique({
      where: { token: tokenString },
    });

    if (!token) {
      return Response.json({ error: 'Invalid token' }, { status: 404 });
    }

    if (!token.isActive) {
      return Response.json({ error: 'This form link is no longer active' }, { status: 403 });
    }

    if (token.expiresAt && token.expiresAt < new Date()) {
      return Response.json({ error: 'This form link has expired' }, { status: 403 });
    }

    await prisma.stakeholderAccessToken.update({
      where: { id: token.id },
      data: {
        stakeholderName: name.trim(),
        stakeholderEmail: email?.trim() || null,
      },
    });

    return Response.json({ success: true, name: name.trim() });
  } catch (error) {
    console.error('Failed to identify stakeholder:', error);
    return Response.json(
      { error: 'Failed to identify stakeholder' },
      { status: 500 }
    );
  }
}
