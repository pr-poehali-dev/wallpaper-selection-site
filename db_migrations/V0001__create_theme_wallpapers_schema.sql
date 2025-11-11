-- TheMe wallpapers platform database schema

-- Wallpapers table
CREATE TABLE IF NOT EXISTS wallpapers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('built-in', 'user-uploaded')),
    author VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    wallpaper_id INTEGER REFERENCES wallpapers(id),
    user_id VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wallpaper_id, user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    wallpaper_id INTEGER REFERENCES wallpapers(id),
    user_id VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallpapers_source ON wallpapers(source_type);
CREATE INDEX IF NOT EXISTS idx_ratings_wallpaper ON ratings(wallpaper_id);
CREATE INDEX IF NOT EXISTS idx_comments_wallpaper ON comments(wallpaper_id);