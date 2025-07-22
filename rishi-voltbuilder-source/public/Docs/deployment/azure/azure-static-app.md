# Azure Static App Deployment Guide

## Overview

This guide details the process for deploying the Rishi workforce management platform as an Azure Static Web App. The deployment leverages Azure's serverless infrastructure and integrates with Neon Database for data persistence.

The application is built with:

- **Next.js 15.2.2** or later
- **React 19.0.0** or later
- **TypeScript 5.8.2** or later
- **Tailwind CSS 3.4.17** or later

## Prerequisites

- Azure account with appropriate permissions
- GitHub repository with the Rishi codebase
- Neon Database account and connection string

## Deployment Steps

### 1. Set Up GitHub Repository

- Ensure your code is in a GitHub repository
- Configure GitHub Actions workflows in `.github/workflows`

### 2. Create Azure Static Web App

- Log in to Azure Portal
- Create a new Static Web App resource
- Link to your GitHub repository
- Configure build settings:
  - App location: `/`
  - API location: `/api`
  - Output location: `.next`
  - Build command: `npm run build`

### 3. Environment Variables

Set the following environment variables in the Azure Portal:

- `DATABASE_URL`: Your Neon Database connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Your application URL
- Any additional service API keys

### 4. Custom Domain Configuration (Optional)

- Add a custom domain in the Azure Portal
- Configure DNS settings with your domain provider
- Set up SSL certificates

### 5. CI/CD Setup

- The default GitHub Actions workflow will:
  - Build the application
  - Run tests
  - Deploy to Azure Static Web Apps
  - Trigger database migrations via Drizzle

### 6. Monitoring and Logging

- Set up Application Insights for monitoring
- Configure Log Analytics for centralized logging
- Create alerts for critical metrics

## Serverless Architecture Considerations

### Pure Serverless Functions

Azure Static Web Apps are designed for true serverless operation:

- Next.js API routes automatically convert to Azure Functions
- Zero infrastructure management requirements
- Sub-second cold starts with optimized runtime

### Exclusive Neon Database Integration

- Neon Database as our **exclusive** serverless database solution
- No traditional connection pooling; uses per-request HTTP connections
- True serverless PostgreSQL with scale-to-zero capabilities
- Isolated compute instances for read vs. write operations

### Separated Calendar Systems

- Agent calendars and client booking systems completely separated
- Independent data models with distinct access patterns
- Zero shared infrastructure for maximum security and performance

### Enterprise Scaling

- Static content distributed via Azure's global CDN
- API routes scale to thousands of concurrent users
- Zero provisioning needed for traffic spikes
- Neon Database autoscales with usage patterns

## Troubleshooting

- Check function logs in Azure Portal
- Verify environment variables are correctly set
- Ensure database connection string is correctly formatted
- Check CORS configuration if experiencing API access issues
