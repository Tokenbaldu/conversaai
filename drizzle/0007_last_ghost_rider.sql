CREATE TABLE `whatsapp_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`waId` varchar(64) NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`businessAccountId` varchar(64),
	`status` enum('pending','active','disconnected') NOT NULL DEFAULT 'pending',
	`qrCode` text,
	`sessionId` varchar(64),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsapp_integrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `whatsapp_integrations_waId_unique` UNIQUE(`waId`),
	CONSTRAINT `whatsapp_integrations_sessionId_unique` UNIQUE(`sessionId`)
);
