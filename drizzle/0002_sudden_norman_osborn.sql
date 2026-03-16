CREATE TABLE `bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`bank` varchar(100),
	`accountType` varchar(50),
	`balance` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_portal_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_portal_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`category` varchar(100),
	`assignedUserId` int,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finance_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('revenue','expense') NOT NULL,
	`color` varchar(7) DEFAULT '#8B5CF6',
	`icon` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `finance_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finance_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('revenue','expense') NOT NULL,
	`categoryId` int,
	`clientId` int,
	`description` varchar(500) NOT NULL,
	`amount` int NOT NULL,
	`date` timestamp NOT NULL,
	`dueDate` timestamp,
	`paidAt` timestamp,
	`status` enum('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`reference` varchar(255),
	`notes` text,
	`recurrence` enum('none','monthly','quarterly','yearly') NOT NULL DEFAULT 'none',
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `finance_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` int NOT NULL,
	`total` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoice_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`description` varchar(500),
	`amount` int NOT NULL,
	`dueDate` timestamp NOT NULL,
	`paidAt` timestamp,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('milestone','update','alert','delivery') NOT NULL DEFAULT 'update',
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`category` varchar(100),
	`uploadedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shared_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`isInternal` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `reports` ADD `isSharedWithClient` boolean DEFAULT false NOT NULL;