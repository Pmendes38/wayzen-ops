CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`tradeName` varchar(255),
	`cnpj` varchar(20),
	`segment` varchar(100),
	`contactName` varchar(255) NOT NULL,
	`contactEmail` varchar(320),
	`contactPhone` varchar(32),
	`contactRole` varchar(100),
	`address` text,
	`city` varchar(100),
	`state` varchar(2),
	`status` enum('prospect','active','paused','churned') NOT NULL DEFAULT 'prospect',
	`notes` text,
	`assignedUserId` int,
	`monthlyFee` int,
	`loaPercentage` int,
	`contractStartDate` timestamp,
	`contractEndDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnel_stages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funnelId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`order` int NOT NULL,
	`color` varchar(7) DEFAULT '#8B5CF6',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funnel_stages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funnels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int,
	`clientId` int,
	`userId` int NOT NULL,
	`type` enum('email','call','meeting','whatsapp','note','follow_up') NOT NULL,
	`subject` varchar(255),
	`content` text,
	`scheduledAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funnelId` int NOT NULL,
	`stageId` int NOT NULL,
	`clientId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`company` varchar(255),
	`source` varchar(100),
	`value` int,
	`notes` text,
	`lossReason` text,
	`assignedUserId` int,
	`status` enum('open','won','lost') NOT NULL DEFAULT 'open',
	`firstResponseAt` timestamp,
	`closedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`type` enum('task_due','follow_up','sprint_update','lead_update','system') NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`linkTo` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playbooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('script','objection_matrix','playbook','template','checklist') NOT NULL,
	`segment` varchar(100),
	`content` text NOT NULL,
	`tags` text,
	`version` int NOT NULL DEFAULT 1,
	`createdByUserId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playbooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`type` enum('weekly','monthly') NOT NULL,
	`title` varchar(255) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`content` text,
	`metrics` text,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sprint_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sprintId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`weekNumber` int NOT NULL,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`assignedUserId` int,
	`dueDate` timestamp,
	`completedAt` timestamp,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sprint_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sprints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`weekNumber` int NOT NULL,
	`status` enum('planned','in_progress','completed') NOT NULL DEFAULT 'planned',
	`startDate` timestamp,
	`endDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sprints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);