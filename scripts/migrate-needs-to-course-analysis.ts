import 'dotenv/config';
import prisma from '../lib/prisma';

async function migrate() {
  const records = await prisma.needsAnalysis.findMany();
  console.log(`Migrating ${records.length} NeedsAnalysis records...`);

  for (const na of records) {
    await prisma.courseAnalysis.upsert({
      where: { pageId: na.pageId },
      create: {
        pageId: na.pageId,
        problemSummary: na.problemStatement,
        currentStateSummary: na.currentState,
        desiredStateSummary: na.desiredState,
        constraints: na.constraints,
        assumptions: na.assumptions,
        learnerPersonas: na.learnerPersonas,
        stakeholders: na.stakeholders,
        smes: na.smes,
        isTrainingSolution: na.isTrainingSolution,
        nonTrainingFactors: na.nonTrainingFactors,
        solutionRationale: na.solutionRationale,
        level1Reaction: na.level1Reaction,
        level2Learning: na.level2Learning,
        level3Behavior: na.level3Behavior,
        level4Results: na.level4Results,
        aiAnalysis: na.aiAnalysis,
        aiRecommendations: na.aiRecommendations,
      },
      update: {},  // Skip if already exists
    });
  }

  console.log('Migration complete.');
}

migrate().catch(console.error).finally(() => prisma.$disconnect());
