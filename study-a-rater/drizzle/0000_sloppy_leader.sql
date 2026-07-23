CREATE TABLE `responses` (
	`submission_id` text NOT NULL,
	`sample_id` text NOT NULL,
	`position` integer NOT NULL CHECK (`position` BETWEEN 1 AND 15),
	`ai_verdict` text NOT NULL CHECK (`ai_verdict` IN ('yes', 'no', 'unsure')),
	`familiar` text NOT NULL CHECK (`familiar` IN ('yes', 'no')),
	`appeal` integer NOT NULL CHECK (`appeal` BETWEEN 1 AND 5),
	`trust` integer NOT NULL CHECK (`trust` BETWEEN 1 AND 5),
	`reason` text NOT NULL CHECK (length(`reason`) <= 280),
	`dwell_ms` integer NOT NULL CHECK (`dwell_ms` BETWEEN 0 AND 7200000),
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`submission_id`, `sample_id`),
	FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`submission_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`submission_id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`slot` integer NOT NULL CHECK (`slot` BETWEEN 1 AND 40),
	`eligible` integer NOT NULL CHECK (`eligible` IN (0, 1)),
	`consented_at` text NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_token_hash_unique` ON `submissions` (`token_hash`);
