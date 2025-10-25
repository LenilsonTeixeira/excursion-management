CREATE TABLE "trip_age_price_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"age_range_id" uuid NOT NULL,
	"final_price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"display_order" integer NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "trip_age_price_groups" ADD CONSTRAINT "trip_age_price_groups_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_age_price_groups" ADD CONSTRAINT "trip_age_price_groups_age_range_id_age_ranges_id_fk" FOREIGN KEY ("age_range_id") REFERENCES "public"."age_ranges"("id") ON DELETE restrict ON UPDATE no action;