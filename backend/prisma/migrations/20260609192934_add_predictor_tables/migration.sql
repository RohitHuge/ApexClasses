-- CreateTable
CREATE TABLE "colleges" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "city" VARCHAR(60) NOT NULL DEFAULT 'Pune',

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cutoffs" (
    "id" SERIAL NOT NULL,
    "college_id" INTEGER NOT NULL,
    "branch" VARCHAR(60) NOT NULL,
    "category" VARCHAR(10) NOT NULL,
    "cutoff" DECIMAL(6,3) NOT NULL,
    "year" SMALLINT NOT NULL DEFAULT 2024,

    CONSTRAINT "cutoffs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colleges_code_key" ON "colleges"("code");

-- CreateIndex
CREATE INDEX "cutoffs_category_branch_cutoff_idx" ON "cutoffs"("category", "branch", "cutoff");

-- CreateIndex
CREATE UNIQUE INDEX "cutoffs_college_id_branch_category_year_key" ON "cutoffs"("college_id", "branch", "category", "year");

-- AddForeignKey
ALTER TABLE "cutoffs" ADD CONSTRAINT "cutoffs_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
