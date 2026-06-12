-- Migration 001: Initial schema
-- This file is a reference; actual migration uses GORM AutoMigrate at startup.
-- The SQL in db/init.sql is used for docker-entrypoint-initdb.d.

CREATE TABLE IF NOT EXISTS comments (
    id            SERIAL PRIMARY KEY,
    post_slug     VARCHAR(255) NOT NULL,
    author_name   VARCHAR(100) NOT NULL,
    author_email  VARCHAR(255),
    content       TEXT NOT NULL,
    parent_id     INT REFERENCES comments(id) ON DELETE CASCADE,
    is_approved   BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
