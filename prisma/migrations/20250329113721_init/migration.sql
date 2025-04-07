-- CreateTable
CREATE TABLE "MemberProfile" (
    "userId" INTEGER NOT NULL,
    "handle" TEXT,
    "handleLower" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "MemberProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "MemberStats" (
    "userId" INTEGER NOT NULL,
    "handle" TEXT,
    "handleLower" TEXT,
    "maxRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "MemberStats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "ResourceRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLower" TEXT NOT NULL,
    "fullReadAccess" BOOLEAN NOT NULL,
    "fullWriteAccess" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "selfObtainable" BOOLEAN NOT NULL,
    "legacyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "ResourceRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberHandle" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceRolePhaseDependency" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "resourceRoleId" TEXT NOT NULL,
    "phaseState" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "ResourceRolePhaseDependency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memberprofile-handleLower-index" ON "MemberProfile"("handleLower");

-- CreateIndex
CREATE UNIQUE INDEX "memberprofile-handle-handleLower-unique" ON "MemberProfile"("handle", "handleLower");

-- CreateIndex
CREATE UNIQUE INDEX "memberstats-handle-handleLower-unique" ON "MemberStats"("handle", "handleLower");

-- CreateIndex
CREATE INDEX "resourcerole-nameLower-index" ON "ResourceRole"("nameLower");

-- CreateIndex
CREATE INDEX "resource-challengeIdMemberId-index" ON "Resource"("challengeId", "memberId");

-- CreateIndex
CREATE INDEX "resource-memberIdRoleId-index" ON "Resource"("memberId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "resourcerolephase-phaseId-resourceRoleId-unique" ON "ResourceRolePhaseDependency"("phaseId", "resourceRoleId");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ResourceRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceRolePhaseDependency" ADD CONSTRAINT "ResourceRolePhaseDependency_resourceRoleId_fkey" FOREIGN KEY ("resourceRoleId") REFERENCES "ResourceRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
