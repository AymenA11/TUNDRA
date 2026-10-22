CREATE TABLE `age_checks` (
	`user_id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`verified_until` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fulfillment` (
	`session_id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`customer_email` text,
	`recipient_json` text NOT NULL,
	`items_json` text NOT NULL,
	`status` text DEFAULT 'awaiting_shipping_setup' NOT NULL,
	`carrier_order_id` text,
	`created_at` integer NOT NULL
);
