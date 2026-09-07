CREATE TABLE `timetable_uploads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`user_email` text NOT NULL,
	`file_name` text NOT NULL,
	`building` text NOT NULL,
	`section` text NOT NULL,
	`academic_year` text NOT NULL,
	`entry_count` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_timetable_uploads_user_created` ON `timetable_uploads` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `uploaded_slots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`upload_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`day` text NOT NULL,
	`period` text NOT NULL,
	`room` text NOT NULL,
	`course` text NOT NULL,
	`section` text NOT NULL,
	`building` text NOT NULL,
	`floor` integer NOT NULL,
	`capacity` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`upload_id`) REFERENCES `timetable_uploads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_uploaded_slots_user_day_period` ON `uploaded_slots` (`user_id`,`day`,`period`);--> statement-breakpoint
CREATE INDEX `idx_uploaded_slots_upload` ON `uploaded_slots` (`upload_id`);