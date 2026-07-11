CREATE TABLE `terms` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`meaning` text NOT NULL,
	`image_url` text NOT NULL,
	`audio_url` text NOT NULL,
	`example` text NOT NULL,
	`category` text NOT NULL,
	`user_id` integer NOT NULL,
	`variant_id` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `terms_content_unique` ON `terms` (`content`);--> statement-breakpoint
CREATE UNIQUE INDEX `terms_meaning_unique` ON `terms` (`meaning`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`first_name` text,
	`maternal_name` text,
	`paternal_name` text,
	`email` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `variants` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`locality_name` text
);
