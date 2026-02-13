Make the following additions to prisma/schema.prisma. Do NOT modify or remove any existing fields.

STEP 1: In the NeedsAnalysis model, add these fields after the existing "level4Results" field and before "createdAt":

  // Training-as-solution decision
  isTrainingSolution    Boolean?
  nonTrainingFactors    String?    @db.Text
  solutionRationale     String?    @db.Text

  // AI analysis capture
  aiAnalysis            String?    @db.Text
  aiRecommendations     String[]   @default([])

STEP 2: In the Storyboard model, add these fields after the existing "deliveryMethod" field and before "createdAt":

  // Design rationale
  designApproach        String?    @db.Text
  mediaSelectionNotes   String?    @db.Text

Do not modify any other fields, models, or enums.

After making all changes, run: npx prisma validate
