Make the following additions to prisma/schema.prisma. Do NOT modify any existing fields or models except to add reverse relations where noted.

STEP 1: Add these new enums. Place them after the BlueprintPriority enum:

enum TaskFrequency {
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  ANNUALLY
  RARELY
}

enum TaskCriticality {
  CRITICAL
  IMPORTANT
  SUPPORTIVE
}

enum TaskComplexity {
  SIMPLE
  MODERATE
  COMPLEX
}

enum KnowledgeType {
  DECLARATIVE
  PROCEDURAL
  CONDITIONAL
  METACOGNITIVE
}

STEP 2: Add this new model after the enums:

model LearningTask {
  id              String            @id @default(cuid())
  courseId         String

  // Core identification
  title           String
  description     String?           @db.Text

  // Task analysis attributes (all enum-typed)
  frequency       TaskFrequency     @default(WEEKLY)
  criticality     TaskCriticality   @default(IMPORTANT)
  complexity      TaskComplexity    @default(MODERATE)
  knowledgeType   KnowledgeType     @default(PROCEDURAL)

  // Standardization
  isStandardized  Boolean           @default(true)
  variationNotes  String?           @db.Text
  isFeasibleToTrain Boolean         @default(true)
  feasibilityNotes  String?         @db.Text

  // External taxonomy mapping
  externalId      String?
  externalSource  String?

  // Hierarchical task analysis
  parentTaskId    String?
  order           Int               @default(0)

  // Design decision capture
  rationale       String?           @db.Text
  aiGenerated     Boolean           @default(false)
  aiReasoning     String?           @db.Text

  // Link to TaskAnalysis page (for migration from JSON blob)
  taskAnalysisId  String?

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  course          Course            @relation(fields: [courseId], references: [id], onDelete: Cascade)
  parentTask      LearningTask?     @relation("TaskHierarchy", fields: [parentTaskId], references: [id])
  childTasks      LearningTask[]    @relation("TaskHierarchy")
  taskAnalysis    TaskAnalysis?     @relation(fields: [taskAnalysisId], references: [id])

  @@index([courseId])
  @@index([externalId])
  @@index([taskAnalysisId])
  @@map("learning_tasks")
}

STEP 3: Add reverse relations to existing models. Add ONLY the relation line, do not change anything else:

In the Course model, add this line after the existing "curricula" relation:
  learningTasks  LearningTask[]

In the TaskAnalysis model, add this line after the existing "tasks" field:
  learningTasks  LearningTask[]

Do not modify any other fields, models, or enums.

After making all changes, run: npx prisma validate
