PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_meanings` (
	`id` text PRIMARY KEY,
	`meaning` text NOT NULL UNIQUE,
	`image_url` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_meanings`(`id`, `meaning`, `image_url`, `category`) SELECT `id`, `meaning`, `image_url`, `category` FROM `meanings`;--> statement-breakpoint
DROP TABLE `meanings`;--> statement-breakpoint
ALTER TABLE `__new_meanings` RENAME TO `meanings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;