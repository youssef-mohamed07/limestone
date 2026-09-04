CREATE TABLE `invoice_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoice_snapshots_number_unique` ON `invoice_snapshots` (`number`);