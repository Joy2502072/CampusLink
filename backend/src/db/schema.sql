-- CampusLink Placement Cell Table Schema
-- MySQL 8.0+ compatible
-- Database creation and selection is handled dynamically by initDb.js using DB_NAME.


-- ============================================================
-- 1. Students Table
-- ============================================================

CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `branch` VARCHAR(50) NOT NULL,
  `cgpa` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,

  `technical_skills` JSON NULL
    COMMENT 'Array of skill strings e.g. ["JavaScript", "Python"]',

  `projects` JSON NULL
    COMMENT 'Array of project metadata objects/titles',

  `certifications` JSON NULL
    COMMENT 'Array of certification names/credentials',

  `communication_score` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,

  `applications_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `rejections_count` INT UNSIGNED NOT NULL DEFAULT 0,

  `status` ENUM(
    'Placed',
    'Unplaced',
    'In-Process',
    'At-Risk'
  ) NOT NULL DEFAULT 'Unplaced',

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  `updated_at` TIMESTAMP NOT NULL
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  UNIQUE KEY `idx_students_email` (`email`),

  KEY `idx_students_branch` (`branch`),

  KEY `idx_students_status` (`status`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 2. Placement Drives Table
-- Truthful schema based on actual drive dataset
-- ============================================================

CREATE TABLE IF NOT EXISTS `placement_drives` (
  `id` VARCHAR(50) NOT NULL,

  `company` VARCHAR(150) NOT NULL,

  `role` VARCHAR(150) NOT NULL,

  `package_lpa` VARCHAR(50) NOT NULL
    COMMENT 'Display string e.g. "18.5 LPA"',

  `package_numeric` DECIMAL(5, 2) NULL
    COMMENT 'Normalized numeric value e.g. 18.50',

  `min_cgpa` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,

  `eligible_branches` JSON NULL
    COMMENT 'Array of eligible branch strings e.g. ["CSE", "IT"]',

  `required_skills` JSON NULL
    COMMENT 'Array of required skill strings; defaults to empty array if unspecified',

  `required_resources` JSON NULL
    COMMENT 'List of required logistics e.g. ["Auditorium", "Lab 2"]',

  `openings` INT UNSIGNED NOT NULL DEFAULT 0,

  `applicants` INT UNSIGNED NOT NULL DEFAULT 0,

  `shortlisted` INT UNSIGNED NOT NULL DEFAULT 0,

  `date` DATE NULL,

  `start_time` VARCHAR(20) NULL,

  `end_time` VARCHAR(20) NULL,

  `venue` VARCHAR(150) NULL,

  `description` TEXT NULL,

  `status` VARCHAR(50) NOT NULL DEFAULT 'Upcoming',

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  `updated_at` TIMESTAMP NOT NULL
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  KEY `idx_drives_company` (`company`),

  KEY `idx_drives_status` (`status`),

  KEY `idx_drives_date` (`date`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 3. Drive Schedules Table
-- ============================================================

CREATE TABLE IF NOT EXISTS `drive_schedules` (
  `id` VARCHAR(50) NOT NULL,

  `drive_id` VARCHAR(50) NOT NULL,

  `round_name` VARCHAR(100) NOT NULL
    COMMENT 'e.g. "Online Assessment", "Technical Interview"',

  `round_number` INT UNSIGNED NOT NULL DEFAULT 1,

  `start_time` DATETIME NOT NULL,

  `end_time` DATETIME NOT NULL,

  `venue` VARCHAR(150) NOT NULL,

  `assigned_resources` JSON NULL,

  `status` ENUM(
    'Scheduled',
    'In-Progress',
    'Completed',
    'Rescheduled',
    'Cancelled'
  ) NOT NULL DEFAULT 'Scheduled',

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  `updated_at` TIMESTAMP NOT NULL
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  KEY `idx_schedules_drive_id` (`drive_id`),

  KEY `idx_schedules_time_window` (`start_time`, `end_time`),

  CONSTRAINT `fk_schedules_drive`
    FOREIGN KEY (`drive_id`)
    REFERENCES `placement_drives` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 4. Offers Table
-- ============================================================

CREATE TABLE IF NOT EXISTS `offers` (
  `id` VARCHAR(50) NOT NULL,

  `student_id` VARCHAR(50) NOT NULL,

  `drive_id` VARCHAR(50) NOT NULL,

  `company` VARCHAR(150) NOT NULL,

  `role` VARCHAR(150) NOT NULL,

  `package_lpa` VARCHAR(50) NOT NULL,

  `package_numeric` DECIMAL(5, 2) NULL,

  `status` ENUM(
    'Pending',
    'Accepted',
    'Rejected',
    'Joining-Confirmed'
  ) NOT NULL DEFAULT 'Pending',

  `released_date` DATE NOT NULL,

  `valid_until` DATE NULL,

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  `updated_at` TIMESTAMP NOT NULL
    DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  KEY `idx_offers_student_id` (`student_id`),

  KEY `idx_offers_drive_id` (`drive_id`),

  KEY `idx_offers_status` (`status`),

  CONSTRAINT `fk_offers_student`
    FOREIGN KEY (`student_id`)
    REFERENCES `students` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `fk_offers_drive`
    FOREIGN KEY (`drive_id`)
    REFERENCES `placement_drives` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. Offer Documents Table
-- ============================================================

CREATE TABLE IF NOT EXISTS `offer_documents` (
  `id` VARCHAR(50) NOT NULL,

  `offer_id` VARCHAR(50) NOT NULL,

  `document_name` VARCHAR(255) NOT NULL,

  `document_type` VARCHAR(50) NOT NULL
    COMMENT 'e.g. "LOI", "Offer Letter", "NDA"',

  `file_url` VARCHAR(500) NULL,

  `verification_status` ENUM(
    'Pending',
    'Verified',
    'Rejected'
  ) NOT NULL DEFAULT 'Pending',

  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  KEY `idx_docs_offer_id` (`offer_id`),

  CONSTRAINT `fk_docs_offer`
    FOREIGN KEY (`offer_id`)
    REFERENCES `offers` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 6. Notifications Table
-- ============================================================

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(50) NOT NULL,

  `recipient_type` ENUM(
    'student',
    'officer',
    'company',
    'all'
  ) NOT NULL DEFAULT 'student',

  `recipient_id` VARCHAR(50) NULL
    COMMENT 'Student ID or targeted user ID; NULL represents broadcast',

  `title` VARCHAR(200) NOT NULL,

  `message` TEXT NOT NULL,

  `type` ENUM(
    'Drive_Alert',
    'Offer_Update',
    'Schedule_Change',
    'General'
  ) NOT NULL DEFAULT 'General',

  `is_read` TINYINT(1) NOT NULL DEFAULT 0,

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  KEY `idx_notifications_recipient`
    (`recipient_type`, `recipient_id`),

  KEY `idx_notifications_read`
    (`is_read`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;