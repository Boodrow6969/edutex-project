import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { WorkspaceRole } from '@prisma/client';

/**
 * Authentication error thrown when user is not authenticated
 */
export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error thrown when user lacks required permissions
 */
export class AuthorizationError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error thrown when a resource doesn't exist
 */
export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * User object returned from getCurrentUserOrThrow
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

/**
 * Gets the current authenticated user from the session.
 * Throws AuthenticationError if not authenticated.
 * In development, can be bypassed with SKIP_AUTH="true" env variable.
 */
export async function getCurrentUserOrThrow(): Promise<AuthUser> {
  // Development-only auth bypass
  if (process.env.SKIP_AUTH === 'true') {
    console.warn('⚠️  AUTH BYPASS ENABLED: Authentication is skipped (SKIP_AUTH=true). This should only be used in development.');

    // Upsert the dev user to ensure it exists in the database
    const devUser = await prisma.user.upsert({
      where: { id: 'dev-user-id' },
      update: {},
      create: {
        id: 'dev-user-id',
        email: 'dev@edutex.local',
        name: 'Dev User',
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return devUser;
  }

  const session = await auth();

  if (!session?.user?.email) {
    throw new AuthenticationError();
  }

  // Fetch the user from database to get the actual user ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });

  if (!user) {
    throw new AuthenticationError('User not found in database');
  }

  return user;
}

/**
 * Result of assertWorkspaceMember check
 */
export interface WorkspaceMembershipResult {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  membershipId: string;
}

/**
 * Asserts that a user is a member of a workspace with optional role requirements.
 *
 * @param workspaceId - The workspace to check membership for
 * @param userId - The user ID to check
 * @param allowedRoles - Optional array of roles that are permitted. If not provided, any role is accepted.
 * @returns The membership details if authorized
 * @throws NotFoundError if the workspace doesn't exist
 * @throws AuthorizationError if user is not a member or doesn't have required role
 * In development, can be bypassed with SKIP_AUTH="true" env variable.
 */
export async function assertWorkspaceMember(
  workspaceId: string,
  userId: string,
  allowedRoles?: WorkspaceRole[]
): Promise<WorkspaceMembershipResult> {
  // Development-only auth bypass
  if (process.env.SKIP_AUTH === 'true') {
    console.warn(`⚠️  WORKSPACE MEMBERSHIP BYPASS: Skipping membership check for workspace ${workspaceId} (SKIP_AUTH=true). This should only be used in development.`);
    // Return fake membership with ADMINISTRATOR role so all role checks pass
    return {
      workspaceId,
      userId,
      role: WorkspaceRole.ADMINISTRATOR,
      membershipId: 'dev-membership',
    };
  }

  // Check if workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true },
  });

  if (!workspace) {
    throw new NotFoundError('Workspace not found');
  }

  // Check membership
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    select: {
      id: true,
      role: true,
      workspaceId: true,
      userId: true,
    },
  });

  if (!membership) {
    throw new AuthorizationError('You are not a member of this workspace');
  }

  // Check role if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(membership.role)) {
      throw new AuthorizationError(
        `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      );
    }
  }

  return {
    workspaceId: membership.workspaceId,
    userId: membership.userId,
    role: membership.role,
    membershipId: membership.id,
  };
}

/**
 * Asserts that a user has access to a project through workspace membership.
 *
 * @param projectId - The project to check access for
 * @param userId - The user ID to check
 * @param allowedRoles - Optional array of roles that are permitted
 * @returns The project with workspace membership info
 * @throws NotFoundError if the project doesn't exist
 * @throws AuthorizationError if user doesn't have access
 */
export async function assertProjectAccess(
  projectId: string,
  userId: string,
  allowedRoles?: WorkspaceRole[]
): Promise<{ projectId: string; workspaceId: string; membership: WorkspaceMembershipResult }> {
  // Development-only auth bypass
  if (process.env.SKIP_AUTH === 'true') {
    console.warn(`⚠️  PROJECT ACCESS BYPASS: Skipping workspace checks for project ${projectId} (SKIP_AUTH=true). This should only be used in development.`);
    
    // Still verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Return fake membership result (similar to assertWorkspaceMember bypass)
    return {
      projectId: project.id,
      workspaceId: project.workspaceId || 'dev-workspace',
      membership: {
        workspaceId: project.workspaceId || 'dev-workspace',
        userId,
        role: WorkspaceRole.ADMINISTRATOR,
        membershipId: 'dev-membership',
      },
    };
  }

  // Get the project and its workspace
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Ensure project has a workspace for access control
  if (!project.workspaceId) {
    throw new AuthorizationError('Project does not belong to a workspace');
  }

  // Check workspace membership
  const membership = await assertWorkspaceMember(
    project.workspaceId,
    userId,
    allowedRoles
  );

  return {
    projectId: project.id,
    workspaceId: project.workspaceId,
    membership,
  };
}

/**
 * Asserts that a user has access to a curriculum through workspace membership.
 *
 * @param curriculumId - The curriculum to check access for
 * @param userId - The user ID to check
 * @param allowedRoles - Optional array of roles that are permitted
 * @returns The curriculum with workspace membership info
 * @throws NotFoundError if the curriculum doesn't exist
 * @throws AuthorizationError if user doesn't have access
 */
export async function assertCurriculumAccess(
  curriculumId: string,
  userId: string,
  allowedRoles?: WorkspaceRole[]
): Promise<{ curriculumId: string; workspaceId: string; membership: WorkspaceMembershipResult }> {
  // Development-only auth bypass
  if (process.env.SKIP_AUTH === 'true') {
    console.warn(`⚠️  CURRICULUM ACCESS BYPASS: Skipping workspace checks for curriculum ${curriculumId} (SKIP_AUTH=true). This should only be used in development.`);

    const curriculum = await prisma.curriculum.findUnique({
      where: { id: curriculumId },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    if (!curriculum) {
      throw new NotFoundError('Curriculum not found');
    }

    return {
      curriculumId: curriculum.id,
      workspaceId: curriculum.workspaceId,
      membership: {
        workspaceId: curriculum.workspaceId,
        userId,
        role: WorkspaceRole.ADMINISTRATOR,
        membershipId: 'dev-membership',
      },
    };
  }

  const curriculum = await prisma.curriculum.findUnique({
    where: { id: curriculumId },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!curriculum) {
    throw new NotFoundError('Curriculum not found');
  }

  const membership = await assertWorkspaceMember(
    curriculum.workspaceId,
    userId,
    allowedRoles
  );

  return {
    curriculumId: curriculum.id,
    workspaceId: curriculum.workspaceId,
    membership,
  };
}

/**
 * Asserts that a user has access to a page through its parent (project or curriculum).
 *
 * @param pageId - The page to check access for
 * @param userId - The user ID to check
 * @param allowedRoles - Optional array of roles that are permitted
 * @returns Access info including the parent type
 * @throws NotFoundError if the page doesn't exist
 * @throws AuthorizationError if user doesn't have access
 */
export async function assertPageAccess(
  pageId: string,
  userId: string,
  allowedRoles?: WorkspaceRole[]
): Promise<{
  pageId: string;
  projectId: string | null;
  curriculumId: string | null;
  workspaceId: string;
  membership: WorkspaceMembershipResult;
}> {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      projectId: true,
      curriculumId: true,
    },
  });

  if (!page) {
    throw new NotFoundError('Page not found');
  }

  if (page.projectId) {
    const access = await assertProjectAccess(page.projectId, userId, allowedRoles);
    return {
      pageId: page.id,
      projectId: page.projectId,
      curriculumId: null,
      workspaceId: access.workspaceId,
      membership: access.membership,
    };
  }

  if (page.curriculumId) {
    const access = await assertCurriculumAccess(page.curriculumId, userId, allowedRoles);
    return {
      pageId: page.id,
      projectId: null,
      curriculumId: page.curriculumId,
      workspaceId: access.workspaceId,
      membership: access.membership,
    };
  }

  throw new AuthorizationError('Page does not belong to a project or curriculum');
}

/**
 * Helper to create a JSON error response
 */
export function errorResponse(
  error: unknown,
  defaultMessage = 'An error occurred'
): Response {
  if (error instanceof AuthenticationError) {
    return Response.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof AuthorizationError) {
    return Response.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof NotFoundError) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  return Response.json(
    { error: error instanceof Error ? error.message : defaultMessage },
    { status: 500 }
  );
}
