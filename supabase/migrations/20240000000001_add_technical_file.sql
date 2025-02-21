-- Add technical_file column to submissions table
ALTER TABLE submissions
ADD COLUMN technical_file TEXT NOT NULL;

-- Update existing rows to have a default value (if needed)
UPDATE submissions
SET technical_file = bmc_file
WHERE technical_file IS NULL; 