CREATE TABLE `pagbank_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`integrationKey` text,
	`accessToken` text,
	`webhookUrl` varchar(500),
	`webhookSecret` text,
	`isActive` boolean NOT NULL DEFAULT false,
	`lastTestAt` timestamp,
	`testStatus` enum('success','failed','pending') DEFAULT 'pending',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pagbank_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pagbank_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`planId` int,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BRL',
	`status` enum('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(32),
	`description` text,
	`metadata` json,
	`errorMessage` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pagbank_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `pagbank_transactions_transactionId_unique` UNIQUE(`transactionId`)
);
