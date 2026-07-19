-- CreateTable: rank_cutoffs
CREATE TABLE "rank_cutoffs" (
    "id" SERIAL NOT NULL,
    "college_id" INTEGER NOT NULL,
    "branch" VARCHAR(60) NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "closing_rank" INTEGER NOT NULL,
    "year" SMALLINT NOT NULL DEFAULT 2024,

    CONSTRAINT "rank_cutoffs_pkey" PRIMARY KEY ("id")
);

-- AddColumns: rank quota to predictor_profiles
ALTER TABLE "predictor_profiles"
    ADD COLUMN "rank_searches_limit" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "rank_searches_used"  INTEGER NOT NULL DEFAULT 0;

-- AddColumn: mode to predictor_searches
ALTER TABLE "predictor_searches"
    ADD COLUMN "mode" VARCHAR(20) NOT NULL DEFAULT 'percentile';

-- AddColumn: product_type to predictor_payments
ALTER TABLE "predictor_payments"
    ADD COLUMN "product_type" VARCHAR(20) NOT NULL DEFAULT 'percentile';

-- CreateIndex
CREATE UNIQUE INDEX "rank_cutoffs_college_id_branch_category_year_key"
    ON "rank_cutoffs"("college_id", "branch", "category", "year");

CREATE INDEX "rank_cutoffs_category_branch_closing_rank_idx"
    ON "rank_cutoffs"("category", "branch", "closing_rank");

-- AddForeignKey
ALTER TABLE "rank_cutoffs"
    ADD CONSTRAINT "rank_cutoffs_college_id_fkey"
    FOREIGN KEY ("college_id") REFERENCES "colleges"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
