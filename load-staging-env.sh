#!/bin/bash
# Force load staging environment variables
export NODE_ENV=staging
export NEXT_PUBLIC_APP_ENV=staging
export STATIC_EXPORT=1
export DATABASE_URL=postgresql://rishinext_owner:npg_okpv0Hhtfwu2@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext_staging?sslmode=require&channel_binding=require
export NEON_DATABASE_URL=postgresql://rishinext_owner:npg_okpv0Hhtfwu2@ep-sweet-flower-a87a0ldg-pooler.eastus2.azure.neon.tech/rishinext_staging?sslmode=require&channel_binding=require
export PGUSER=rishinext_owner
export PGPASSWORD=npg_okpv0Hhtfwu2
export NEXT_PUBLIC_APP_NAME="Rishi Platform Staging"
export JWT_SECRET=staging-jwt-secret-key-change-this
export JWT_REFRESH_SECRET=staging-jwt-refresh-secret-change-this
export NEXT_PUBLIC_ENABLE_DEBUG=true
export NEXT_PUBLIC_ENABLE_ANALYTICS=false
export NEXT_PUBLIC_SHOW_ENV_BANNER=true
