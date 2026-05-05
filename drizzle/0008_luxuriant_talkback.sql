CREATE TABLE `whatsapp_connection_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`whatsappIntegrationId` int NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('connected','disconnected','failed','scanned','expired') NOT NULL,
	`phoneNumber` varchar(20),
	`errorMessage` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsapp_connection_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_synced_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`whatsappIntegrationId` int NOT NULL,
	`userId` int NOT NULL,
	`contactId` int NOT NULL,
	`waPhoneNumber` varchar(20) NOT NULL,
	`waJid` varchar(64) NOT NULL,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSyncAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsapp_synced_contacts_id` PRIMARY KEY(`id`)
);
