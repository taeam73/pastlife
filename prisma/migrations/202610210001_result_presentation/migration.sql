ALTER TABLE "results" ADD COLUMN "presentationJson" JSONB;
ALTER TABLE "result_images" ADD COLUMN "layersJson" JSONB;
ALTER TABLE "result_images" ADD COLUMN "compositeUri" TEXT;
