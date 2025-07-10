#!/bin/bash

# Setup Local PostgreSQL Database for Development
# This script sets up a local PostgreSQL instance in Replit

echo "🔧 Setting up local PostgreSQL database for development..."

# Check if PostgreSQL is already installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    # Install PostgreSQL via Nix package manager
    nix-env -iA nixpkgs.postgresql
fi

# Create data directory
mkdir -p $HOME/postgres-data

# Initialize database if not exists
if [ ! -d "$HOME/postgres-data/base" ]; then
    echo "🗄️  Initializing PostgreSQL database..."
    initdb -D $HOME/postgres-data
fi

# Start PostgreSQL server
echo "🚀 Starting PostgreSQL server..."
pg_ctl -D $HOME/postgres-data -l $HOME/postgres-data/logfile start

# Wait for server to start
sleep 2

# Create development database
echo "📋 Creating development database..."
createdb rishinext_dev 2>/dev/null || echo "Database already exists"

# Create user (if needed)
psql -d rishinext_dev -c "CREATE USER rishinext_dev WITH PASSWORD 'dev_password';" 2>/dev/null || echo "User already exists"
psql -d rishinext_dev -c "GRANT ALL PRIVILEGES ON DATABASE rishinext_dev TO rishinext_dev;" 2>/dev/null

echo "✅ Local PostgreSQL setup complete!"
echo "📍 Database URL: postgresql://rishinext_dev:dev_password@localhost:5432/rishinext_dev"
echo "🔍 To connect: psql -d rishinext_dev"