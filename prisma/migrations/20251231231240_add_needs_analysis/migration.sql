-- CreateTable
CREATE TABLE "needs_analyses" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL DEFAULT '',
    "businessNeed" TEXT NOT NULL DEFAULT '',
    "department" TEXT NOT NULL DEFAULT '',
    "constraints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "assumptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "learnerPersonas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stakeholders" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "smes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentState" TEXT NOT NULL DEFAULT '',
    "desiredState" TEXT NOT NULL DEFAULT '',
    "level1Reaction" TEXT NOT NULL DEFAULT '',
    "level2Learning" TEXT NOT NULL DEFAULT '',
    "level3Behavior" TEXT NOT NULL DEFAULT '',
    "level4Results" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "needs_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_blueprints" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "deliveryMode" TEXT NOT NULL,
    "timeBudgetMinutes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_blueprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_needs" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "desiredBehavior" TEXT NOT NULL,
    "consequences" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_needs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blueprint_objectives" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "bloomLevel" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "requiresAssessment" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blueprint_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constraints" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constraints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_patterns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bestForBloomLevels" TEXT NOT NULL,
    "references" TEXT,
    "typicalDurationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_instances" (
    "id" TEXT NOT NULL,
    "blueprintId" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "positionIndex" INTEGER NOT NULL,
    "notes" TEXT,
    "learnerDeliverable" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_instances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "needs_analyses_pageId_key" ON "needs_analyses"("pageId");

-- AddForeignKey
ALTER TABLE "needs_analyses" ADD CONSTRAINT "needs_analyses_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_blueprints" ADD CONSTRAINT "learning_blueprints_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_needs" ADD CONSTRAINT "performance_needs_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "learning_blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blueprint_objectives" ADD CONSTRAINT "blueprint_objectives_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "learning_blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constraints" ADD CONSTRAINT "constraints_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "learning_blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_instances" ADD CONSTRAINT "activity_instances_blueprintId_fkey" FOREIGN KEY ("blueprintId") REFERENCES "learning_blueprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_instances" ADD CONSTRAINT "activity_instances_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "blueprint_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_instances" ADD CONSTRAINT "activity_instances_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "activity_patterns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
