-- Add bmc_url column to submissions table
ALTER TABLE submissions
ADD COLUMN bmc_url TEXT;

-- Modify bmc_file to be nullable
ALTER TABLE submissions
ALTER COLUMN bmc_file DROP NOT NULL;

-- Add constraint to ensure either bmc_file or bmc_url is provided
ALTER TABLE submissions
ADD CONSTRAINT bmc_check CHECK (
    (bmc_file IS NOT NULL AND bmc_url IS NULL) OR
    (bmc_file IS NULL AND bmc_url IS NOT NULL)
); 