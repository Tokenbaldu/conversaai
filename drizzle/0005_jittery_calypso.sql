CREATE TABLE `oauth_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`clientId` varchar(256) NOT NULL,
	`clientSecret` text NOT NULL,
	`redirectUris` json NOT NULL,
	`scopes` json NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `oauth_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `oauth_applications_clientId_unique` UNIQUE(`clientId`)
);
