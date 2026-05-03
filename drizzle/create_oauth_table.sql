-- Create OAuth Applications table
CREATE TABLE IF NOT EXISTS `oauth_applications` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `name` varchar(128) NOT NULL,
  `clientId` varchar(256) NOT NULL UNIQUE,
  `clientSecret` text NOT NULL,
  `redirectUris` json NOT NULL,
  `scopes` json NOT NULL,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default WordPress OAuth application
INSERT INTO `oauth_applications` (
  `name`,
  `clientId`,
  `clientSecret`,
  `redirectUris`,
  `scopes`,
  `isActive`
) VALUES (
  'WordPress Integration',
  'conversaia_wp_c913a650bcdeacbe',
  '68b5ed7b243305456e1f90914c047a508f288632e5ffeee0e1c416a61abaf43f',
  '["https://seu-wordpress.com/wp-admin/admin.php?page=conversaia-cloud"]',
  '["openid", "profile", "email"]',
  true
) ON DUPLICATE KEY UPDATE `updatedAt` = CURRENT_TIMESTAMP;
