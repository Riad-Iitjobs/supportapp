-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
-- Note: This is for development only. Change the password in production!
INSERT INTO admin_users (email, password_hash, name)
VALUES (
  'admin@supporthub.com',
  '$2b$10$7AM9ckY89EdmndWoCrqvSOeHRzOTN3Im4VhS261THklbL/g4gHz9W',
  'Admin User'
)
ON DUPLICATE KEY UPDATE email = email;

-- Note: The above hash is a placeholder.
-- You need to generate the actual hash for 'admin123' using bcrypt with 10 rounds
-- Run this after installation: node -e "console.log(require('bcrypt').hashSync('admin123', 10))"
