import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            phase: true,
            updatedAt: true,
            _count: {
              select: {
                pages: true,
                objectives: true,
                tasks: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        curricula: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            programDuration: true,
            totalHours: true,
            _count: {
              select: {
                courses: true,
                pages: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: {
            projects: true,
            curricula: true,
            members: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Transform the response to use "courses" instead of "projects" for clarity
    const response = {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      createdAt: workspace.createdAt,
      courses: workspace.projects, // Rename projects to courses for UI
      curricula: workspace.curricula,
      _count: {
        courses: workspace._count.projects,
        curricula: workspace._count.curricula,
        members: workspace._count.members,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;
    const body = await request.json();

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: body.name,
        description: body.description,
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    );
  }
}
