-- Ensure no duplicates exist before applying the constraint
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) as row_num
  FROM "Audience"
)
DELETE FROM "Audience"
WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);

-- Apply the unique constraint
CREATE UNIQUE INDEX "Audience_email_key" ON "Audience"("email");