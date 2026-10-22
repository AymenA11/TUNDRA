CREATE TABLE `orders` (
	`session_id` text PRIMARY KEY NOT NULL,
	`payment_status` text NOT NULL,
	`amount_total` integer,
	`currency` text,
	`created_at` integer NOT NULL
);
