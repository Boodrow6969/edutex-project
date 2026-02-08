/**
 * Storyboard Export API Route
 * GET /api/pages/[pageId]/export?format=docx
 * 
 * Exports a storyboard page to Word document format.
 * Works with Page model (which has blocks) and optional Storyboard relation (metadata).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { storyboardToDocx } from '@/lib/export/storyboard-to-docx';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'docx';
    const includeEmptyFields = searchParams.get('includeEmpty') === 'true';

    // Validate format
    if (format !== 'docx') {
      return NextResponse.json(
        { error: 'Unsupported format. Only docx is currently supported.' },
        { status: 400 }
      );
    }

    // Fetch page with blocks and related data
    // Schema: Page has blocks[], optional storyboard relation, and course relation
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        blocks: {
          orderBy: { order: 'asc' },
        },
        storyboard: true,  // Storyboard model has targetAudience, status, version
        course: true,      // For course name
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Verify this is a storyboard page
    if (page.type !== 'STORYBOARD') {
      return NextResponse.json(
        { error: 'Export is only available for storyboard pages' },
        { status: 400 }
      );
    }

    // Transform blocks to export format
    const blocks = page.blocks.map(block => ({
      id: block.id,
      type: block.type,
      content: block.content as Record<string, unknown>,
      order: block.order,
    }));

    // Extract storyboard metadata from Storyboard model (if exists)
    const storyboardMetadata = page.storyboard ? {
      targetAudience: page.storyboard.targetAudience || undefined,
      status: page.storyboard.status || undefined,
      linkedObjectiveIds: page.storyboard.linkedObjectiveIds || undefined,
      version: page.storyboard.version || undefined,
    } : undefined;

    // Generate the Word document
    const buffer = await storyboardToDocx(blocks, {
      pageTitle: page.title || 'Storyboard',
      projectName: page.course?.name,
      storyboardMetadata,
      exportDate: new Date(),
      includeEmptyFields,
    });

    // Generate filename
    const sanitizedTitle = (page.title || 'storyboard')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedTitle}_${timestamp}.docx`;

    // Return as downloadable file
    // Convert Node.js Buffer to Uint8Array for Web API compatibility
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Storyboard export error:', error);
    return NextResponse.json(
      { error: 'Failed to export storyboard' },
      { status: 500 }
    );
  }
}
