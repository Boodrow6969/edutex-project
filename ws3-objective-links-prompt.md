Make the following additions to prisma/schema.prisma. Do NOT modify any existing fields except where explicitly noted. Do NOT remove any existing fields, relations, or comments.

STEP 1: Add this new enum after the KnowledgeType enum:

enum AssessmentType {
  MULTIPLE_CHOICE
  MULTIPLE_SELECT
  TRUE_FALSE
  SHORT_ANSWER
  MATCHING
  ORDERING
  SCENARIO_BASED
  PERFORMANCE_CHECKLIST
  ESSAY
}

STEP 2: Modify the existing Objective model. Keep ALL existing fields exactly as they are. ADD these new fields after the existing "tags" field and before "createdAt":

  // Mager's ABCD components
  condition      String?    @db.Text
  criteria       String?    @db.Text

  // External taxonomy mapping
  externalId     String?
  externalSource String?

  // Design decision capture
  rationale      String?    @db.Text
  aiGenerated    Boolean    @default(false)
  aiReasoning    String?    @db.Text

Also ADD these two reverse relations after the existing "course" relation and before the @@map line:

  // Explicit relationships for adaptive engine consumption
  taskLinks       ObjectiveTaskLink[]
  assessmentLinks ObjectiveAssessmentLink[]

Also ADD this index before the @@map line:

  @@index([externalId])

STEP 3: Add the AssessmentItem model. Place it after the Objective model:

model AssessmentItem {
  id            String          @id @default(cuid())
  courseId       String
  type          AssessmentType

  // Content
  stem          String          @db.Text
  options       Json?
  correctAnswer Json?
  feedback      Json?

  // Classification
  bloomLevel    BloomLevel
  difficulty    Int             @default(2)

  // External mapping
  externalId    String?

  // Design decisions
  rationale     String?         @db.Text
  aiGenerated   Boolean         @default(false)
  aiReasoning   String?         @db.Text

  order         Int             @default(0)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  course        Course          @relation(fields: [courseId], references: [id], onDelete: Cascade)
  objectives    ObjectiveAssessmentLink[]

  @@index([courseId])
  @@index([courseId, bloomLevel])
  @@map("assessment_items")
}

STEP 4: Add the ObjectiveTaskLink join table. Place it after AssessmentItem:

model ObjectiveTaskLink {
  id             String       @id @default(cuid())
  objectiveId    String
  learningTaskId String
  relationship   String?

  objective      Objective    @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  learningTask   LearningTask @relation(fields: [learningTaskId], references: [id], onDelete: Cascade)

  @@unique([objectiveId, learningTaskId])
  @@map("objective_task_links")
}

STEP 5: Add the ObjectiveAssessmentLink join table. Place it after ObjectiveTaskLink:

model ObjectiveAssessmentLink {
  id                 String         @id @default(cuid())
  objectiveId        String
  assessmentItemId   String
  bloomLevelAssessed BloomLevel
  isAligned          Boolean        @default(true)
  alignmentNotes     String?

  objective          Objective          @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  assessmentItem     AssessmentItem     @relation(fields: [assessmentItemId], references: [id], onDelete: Cascade)

  @@unique([objectiveId, assessmentItemId])
  @@map("objective_assessment_links")
}

STEP 6: Add reverse relations to existing models.

In the Course model, add after the existing learningTasks relation:
  assessmentItems AssessmentItem[]

In the LearningTask model, add after the existing taskAnalysis relation and before the @@index lines:
  objectives      ObjectiveTaskLink[]

STEP 7: Add external ID fields to Course and Curriculum models.

In the Course model, add after the existing archivedAt field:
  // External mapping
  externalId      String?
  externalSource  String?

Also add this index to the Course model (before the @@map line):
  @@index([externalId])

In the Curriculum model, add after the existing archivedAt field:
  // External mapping
  externalId      String?
  externalSource  String?

Also add this index to the Curriculum model (before the @@map line):
  @@index([externalId])

Do not modify any other existing fields, models, or enums beyond what is specified above.

After making all changes, run: npx prisma validate
