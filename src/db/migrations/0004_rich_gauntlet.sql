ALTER TABLE "age_ranges" ALTER COLUMN "min_age" SET DATA TYPE integer USING min_age::integer;--> statement-breakpoint
ALTER TABLE "age_ranges" ALTER COLUMN "max_age" SET DATA TYPE integer USING max_age::integer;--> statement-breakpoint
ALTER TABLE "age_ranges" ALTER COLUMN "occupies_seat" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "age_ranges" ALTER COLUMN "occupies_seat" SET DATA TYPE boolean USING occupies_seat::boolean;--> statement-breakpoint
ALTER TABLE "age_ranges" ALTER COLUMN "occupies_seat" SET DEFAULT true;