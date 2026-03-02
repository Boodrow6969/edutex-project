Add Zod validation to app/api/pages/[pageId]/needs-analysis/route.ts (PUT handler only).

Step 1: Install Zod if not already installed
Check package.json first. If zod is not present, run: npm install zod

Step 2: Add this schema at the top of the file, after the imports:

import { z } from 'zod';

const needsAnalysisSchema = z.object({
  problemStatement: z.string().max(5000).optional(),
  businessNeed: z.string().max(5000).optional(),
  department: z.string().max(500).optional(),
  currentState: z.string().max(5000).optional(),
  desiredState: z.string().max(5000).optional(),
  constraints: z.array(z.string().max(1000)).optional(),
  assumptions: z.array(z.string().max(1000)).optional(),
  learnerPersonas: z.array(z.string().max(1000)).optional(),
  stakeholders: z.array(z.string().max(1000)).optional(),
  smes: z.array(z.string().max(1000)).optional(),
  level1Reaction: z.string().max(2000).optional(),
  level2Learning: z.string().max(2000).optional(),
  level3Behavior: z.string().max(2000).optional(),
  level4Results: z.string().max(2000).optional(),
});

Step 3: In the PUT handler, replace the raw request.json() destructuring with:

const body = await request.json();
const result = needsAnalysisSchema.safeParse(body);
if (!result.success) {
  return Response.json(
    { error: 'Invalid request body', details: result.error.flatten() },
    { status: 400 }
  );
}
const { problemStatement, businessNeed, ... } = result.data;

Step 4: Remove all the existing ?? fallback defaults on individual fields — 
Zod optional() handles missing fields, the data object will have undefined for 
missing fields which Prisma handles correctly.

Show me the diff before applying. Do not touch the GET handler.