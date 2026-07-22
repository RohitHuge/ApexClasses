DO $$
DECLARE
  rank_rows bigint;
BEGIN
  SELECT COUNT(*) INTO rank_rows FROM rank_cutoffs;
  IF rank_rows = 0 THEN
    RAISE EXCEPTION 'rank_cutoffs is empty — seeding failed';
  END IF;
  RAISE NOTICE 'rank_cutoffs rows: %', rank_rows;
END $$;
