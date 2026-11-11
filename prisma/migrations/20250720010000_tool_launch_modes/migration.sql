-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ToolLaunchMode" AS ENUM ('PROXY', 'EXTENSION', 'DIRECT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Tool" ADD COLUMN IF NOT EXISTS "launchMode" "ToolLaunchMode" NOT NULL DEFAULT 'PROXY';

-- Cloudflare-protected tools must use the browser extension launcher.
UPDATE "Tool"
SET "launchMode" = 'EXTENSION'
WHERE lower(slug) IN ('canva', 'grammarly', 'quillbot')
   OR lower(name) IN ('canva', 'grammarly', 'quillbot');
