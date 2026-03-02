/**
 * Learning Objectives Export API Route
 * GET /api/courses/[courseId]/objectives/export?format=docx|pdf
 *
 * Exports course objectives to Word or PDF format.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateObjectivesDocx } from '@/lib/export/objectives-to-docx';
import {
  getCurrentUserOrThrow,
  assertCourseAccess,
  errorResponse,
} from '@/lib/auth-helpers';
import { exec } from 'child_process';
import { writeFile, readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ courseId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { courseId } = await params;

    const user = await getCurrentUserOrThrow();
    await assertCourseAccess(courseId, user.id);

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'docx';

    if (format !== 'docx' && format !== 'pdf') {
      return NextResponse.json(
        { error: 'Unsupported format. Use ?format=docx or ?format=pdf' },
        { status: 400 }
      );
    }

    // Fetch course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { name: true, courseType: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Fetch objectives with linked triage items
    const objectives = await prisma.objective.findMany({
      where: { courseId },
      include: {
        linkedTriageItem: { select: { id: true, text: true, column: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Fetch all triage items
    const triageItems = await prisma.triageItem.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
    });

    // Build validation summary
    const bloomDistribution: Record<string, number> = {};
    let withParentTask = 0;

    for (const obj of objectives) {
      // Count bloom levels
      if (obj.bloomLevel) {
        bloomDistribution[obj.bloomLevel] = (bloomDistribution[obj.bloomLevel] || 0) + 1;
      }
      // Count linked objectives
      if (obj.linkedTriageItemId) {
        withParentTask++;
      }
    }

    const exportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate docx
    const buffer = await generateObjectivesDocx({
      courseName: course.name,
      courseType: course.courseType || undefined,
      exportDate,
      objectives: objectives.map((obj) => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        bloomLevel: obj.bloomLevel,
        priority: obj.objectivePriority,
        condition: obj.condition,
        criteria: obj.criteria,
        audience: obj.audience,
        linkedTriageItemId: obj.linkedTriageItemId,
        parentTaskTitle: obj.linkedTriageItem?.text || null,
      })),
      triageItems: triageItems.map((t) => ({
        id: t.id,
        title: t.text,
        column: t.column,
      })),
      validationSummary:
        objectives.length > 0
          ? {
              totalObjectives: objectives.length,
              withParentTask,
              orphaned: objectives.length - withParentTask,
              bloomDistribution,
            }
          : undefined,
    });

    // Sanitize filename
    const sanitizedName = course.name
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    if (format === 'docx') {
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Learning_Objectives_${sanitizedName}.docx"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    }

    // PDF conversion via LibreOffice
    const tempId = randomUUID();
    const tempDocx = join(tmpdir(), `lo-export-${tempId}.docx`);
    const tempPdf = join(tmpdir(), `lo-export-${tempId}.pdf`);

    try {
      await writeFile(tempDocx, buffer);

      await new Promise<void>((resolve, reject) => {
        // LibreOffice headless conversion
        // Note: On Windows dev environments, LibreOffice may need to run inside Docker
        exec(
          `soffice --headless --convert-to pdf --outdir "${tmpdir()}" "${tempDocx}"`,
          { timeout: 30000 },
          (error) => {
            if (error) reject(error);
            else resolve();
          }
        );
      });

      // LibreOffice names the output based on input filename
      const expectedPdf = tempDocx.replace(/\.docx$/, '.pdf');
      const pdfBuffer = await readFile(expectedPdf);

      // Clean up temp files
      await unlink(tempDocx).catch(() => {});
      await unlink(expectedPdf).catch(() => {});

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Learning_Objectives_${sanitizedName}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    } catch {
      // Clean up on failure
      await unlink(tempDocx).catch(() => {});
      await unlink(tempPdf).catch(() => {});

      return NextResponse.json(
        {
          error: 'PDF export requires LibreOffice. Word export is available.',
          fallback: 'docx',
        },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error('Objectives export error:', error);
    return errorResponse(error, 'Failed to export objectives');
  }
}
