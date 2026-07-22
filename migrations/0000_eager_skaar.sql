CREATE TABLE `terms` (
	`id` integer PRIMARY KEY NOT NULL,
	`meaning` text NOT NULL,
	`image_url` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `terms_meaning_unique` ON `terms` (`meaning`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`first_name` text,
	`maternal_name` text,
	`paternal_name` text,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `variants` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`content` text NOT NULL,
	`audio_url` text NOT NULL,
	`example` text NOT NULL,
	`translation_example` text NOT NULL,
	`state` text NOT NULL,
	`municipality` text NOT NULL,
	`locality` text NOT NULL,
	`email` text,
	`is_active` integer DEFAULT false NOT NULL,
	`term_id` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON UPDATE no action ON DELETE cascade
);
