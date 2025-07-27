# Rishi Platform

Cannabis workforce management platform with advanced scheduling, inventory management, and role-based access control.

## 🚀 Features

- **🗓️ Advanced Scheduling** - Mobile-responsive calendar with availability management
- **👥 Role-Based Access Control** - Super Admin, Field Manager, Brand Agent roles
- **📦 Inventory Management** - Kit templates, instances, and consumption tracking
- **📱 Mobile-First Design** - Responsive interface optimized for mobile devices
- **🔐 Secure Authentication** - JWT-based authentication with refresh tokens
- **📊 Real-Time Analytics** - Dashboard with performance metrics and reporting
- **🏢 Multi-Organization** - Support for multiple cannabis organizations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.5, React 19, TypeScript
- **Backend**: Next.js API Routes (161 endpoints)
- **Database**: PostgreSQL with Drizzle ORM (32 tables)
- **UI**: Tailwind CSS, Shadcn/ui components
- **Authentication**: JWT with refresh tokens
- **Deployment**: Vercel (Production), Replit (Development/Staging)

## 📁 Project Structure

```
rishi-platform/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (161 endpoints)
│   ├── components/        # React components
│   ├── dashboard/         # Dashboard pages
│   ├── availability/      # Calendar and scheduling
│   ├── inventory/         # Kit management
│   └── admin/            # Admin panels
├── components/           # Shared UI components
├── lib/                 # Utility functions
├── shared/              # Database schema and types
├── server/              # Server configuration
└── services/            # Business logic services
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-jwt-secret-here"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-here"
NODE_ENV="development"
NEXT_PUBLIC_APP_ENV="development"
```

## 🏗️ Architecture

### Database Schema (32 Tables)
- **Users & Authentication** - User management, roles, permissions
- **Organizations** - Multi-tenant organization structure
- **Bookings & Events** - Cannabis event management
- **Inventory System** - Kit templates, instances, consumption tracking
- **Scheduling** - Availability blocks, assignments, shifts

### API Structure (161 Endpoints)
- **Authentication** - Login, logout, session management
- **Organizations** - Multi-organization support
- **Scheduling** - Availability management, conflict detection
- **Inventory** - Kit management, stock tracking
- **Users** - User management, role assignments
- **Analytics** - Performance metrics, reporting

### Role-Based Access Control
- **Super Admin** - Full system access, organization management
- **Field Manager** - Team management, scheduling, inventory
- **Brand Agent** - Personal scheduling, event assignments
- **Client User** - Basic access, team overview

## 🎯 Key Features

### Advanced Calendar System
- Mobile-responsive FullCalendar integration
- Dynamic window width tracking
- Responsive aspect ratios (1.0 mobile, 1.4 tablet, 1.8 desktop)
- Availability management with conflict detection

### Inventory Management
- Kit templates for brand-specific equipment
- Kit instances for field deployment tracking
- Consumption logging and replenishment workflow
- Stock level monitoring and alerts

### Cannabis Industry Specific
- Event booking management
- Brand activation tracking
- Field staff coordination
- Performance analytics

## 🚀 Deployment

### Vercel (Production)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

### Environment Variables for Production
- `DATABASE_URL` - Production PostgreSQL connection
- `JWT_SECRET` - Secure JWT secret
- `JWT_REFRESH_SECRET` - Secure refresh token secret
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_ENV=production`

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open database studio

### Testing
- Login credentials: `mike` / `wrench519`
- Super admin access to all features
- Test organization: "Rishi Internal"

## 📊 Current Status

- ✅ **Complete Frontend** - All user interfaces implemented
- ✅ **Full Backend** - 161 API endpoints functional
- ✅ **Database** - 32 tables with sample data
- ✅ **Authentication** - JWT-based security system
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Production Ready** - Vercel deployment configured

## 🎨 UI Components

Built with Shadcn/ui and Tailwind CSS:
- Form components with validation
- Data tables with pagination
- Modal dialogs and alerts
- Mobile-responsive navigation
- Theme switching (light/dark)

## 🔐 Security

- JWT-based authentication
- Secure password hashing
- Role-based access control
- Environment variable protection
- Cross-origin request handling

## 📈 Performance

- Server-side rendering with Next.js
- Optimized bundle splitting
- Image optimization
- Database query optimization
- Mobile-first responsive design

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🏢 Cannabis Industry Focus

This platform is specifically designed for cannabis workforce management, featuring:
- Compliance-ready operational tracking
- Cannabis event management
- Brand activation coordination
- Field staff optimization
- Industry-specific analytics

---

**Built with ❤️ for the cannabis industry**