-- Add users table for authentication
CREATE TABLE IF NOT EXISTS t_p23614249_wallpaper_selection_.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settings JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_users_username ON t_p23614249_wallpaper_selection_.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON t_p23614249_wallpaper_selection_.users(email);