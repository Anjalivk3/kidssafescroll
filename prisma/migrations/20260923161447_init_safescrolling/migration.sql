-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'ANALYZED', 'ERROR');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('SAFE', 'LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('ALLOW', 'RESTRICT', 'REVIEW');

-- CreateEnum
CREATE TYPE "ParentDecision" AS ENUM ('ALLOWED', 'RESTRICTED', 'REVIEW');

-- CreateEnum
CREATE TYPE "SafetyCategory" AS ENUM ('VIOLENCE', 'PROFANITY', 'ADULT_CONTENT', 'DANGEROUS_BEHAVIOR', 'DRUGS', 'HATE_CONTENT', 'DISTURBING_CONTENT', 'SELF_HARM', 'NONE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyPolicy" (
    "id" SERIAL NOT NULL,
    "childId" INTEGER NOT NULL,
    "violence" BOOLEAN NOT NULL DEFAULT true,
    "profanity" BOOLEAN NOT NULL DEFAULT true,
    "adultContent" BOOLEAN NOT NULL DEFAULT true,
    "dangerousBehavior" BOOLEAN NOT NULL DEFAULT true,
    "drugs" BOOLEAN NOT NULL DEFAULT true,
    "hateContent" BOOLEAN NOT NULL DEFAULT true,
    "disturbingContent" BOOLEAN NOT NULL DEFAULT true,
    "selfHarm" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSubmission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "childId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "transcript" TEXT,
    "imageUrl" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "parentDecision" "ParentDecision",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyAnalysis" (
    "id" SERIAL NOT NULL,
    "submissionId" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,
    "recommendation" "Recommendation" NOT NULL,
    "detectedCategories" "SafetyCategory"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SafetyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Child_userId_idx" ON "Child"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyPolicy_childId_key" ON "SafetyPolicy"("childId");

-- CreateIndex
CREATE INDEX "ContentSubmission_userId_idx" ON "ContentSubmission"("userId");

-- CreateIndex
CREATE INDEX "ContentSubmission_childId_idx" ON "ContentSubmission"("childId");

-- CreateIndex
CREATE INDEX "ContentSubmission_userId_createdAt_idx" ON "ContentSubmission"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyAnalysis_submissionId_key" ON "SafetyAnalysis"("submissionId");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyPolicy" ADD CONSTRAINT "SafetyPolicy_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentSubmission" ADD CONSTRAINT "ContentSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentSubmission" ADD CONSTRAINT "ContentSubmission_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyAnalysis" ADD CONSTRAINT "SafetyAnalysis_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ContentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
