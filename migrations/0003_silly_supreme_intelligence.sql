DROP INDEX "terms_content_unique";--> statement-breakpoint
DROP INDEX "terms_meaning_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `terms` ALTER COLUMN "audio_url" TO "audio_url" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `terms_content_unique` ON `terms` (`content`);--> statement-breakpoint
CREATE UNIQUE INDEX `terms_meaning_unique` ON `terms` (`meaning`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);