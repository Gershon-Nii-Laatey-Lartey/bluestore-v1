# BlueStore Ghana

Modern e-commerce platform for Ghanaian marketplace built with React, TypeScript, and Supabase.

##  Features

### Core Features
- **Multi-category Marketplace** - Electronics, Fashion, Automotive, Gaming, Sports, Home & Garden
- **User Authentication** - Secure sign-up/sign-in with Supabase Auth
- **Product Management** - Create, edit, and manage product listings
- **Real-time Chat** - Built-in messaging system for buyers and sellers
- **Payment Integration** - Paystack integration for secure payments
- **Subscription Plans** - Multiple ad packages with different features
- **KYC Verification** - Identity verification for enhanced security
- **Admin Dashboard** - Comprehensive admin panel for platform management
- **Mobile Responsive** - Optimized for all device sizes

### Advanced Features
- **Dark/Light Theme** - Theme persistence across sessions
- **Favorites System** - Save and manage favorite products
- **Search & Filtering** - Advanced product search with filters
- **Analytics Dashboard** - Detailed analytics for vendors and admins
- **Live Chat Support** - Customer support system
- **Location Services** - Location-based product discovery
- **Image Optimization** - Automatic image compression and optimization
- **SEO Optimized** - Meta tags and structured data

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Supabase account (for backend services)

### Installation
```bash
# Clone the repository
git clone https://github.com/Gershon-Nii-Laatey-Lartey/bluestore-v1.git
cd bluestore-v1

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

## 📦 Package Management

### **Package Manager Strategy**
This project uses **npm** as the primary package manager to ensure consistency across all environments.

### **Available Scripts**
```bash
# Development
npm run dev              # Start development server
npm run preview          # Preview production build

# Building
npm run build           # Build for production
npm run build:dev       # Build for development
npm run build:prod      # Build for production (explicit)

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # Run TypeScript type checking

# Maintenance
npm run clean           # Clean build artifacts
npm run install:clean   # Clean install (removes node_modules and reinstalls)
```

## 🏗️ Architecture

### **Frontend Stack**
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management

### **UI & Styling**
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Next Themes** - Theme management
- **Framer Motion** - Animations (where needed)

### **Backend & Services**
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Storage
  - Edge Functions
- **Paystack** - Payment processing
- **Image Optimization** - Automatic image compression

### **Development Tools**
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Vite** - Build tooling
- **PostCSS** - CSS processing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat system components
│   ├── kyc/            # KYC verification components
│   ├── payment/        # Payment-related components
│   ├── product/        # Product-related components
│   ├── publish-ad/     # Ad publishing components
│   ├── ui/             # Base UI components
│   └── vendor/         # Vendor-specific components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility libraries
├── pages/              # Page components
├── services/           # API and business logic
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔧 Configuration

### **Environment Variables**
Create a `.env.local` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### **Supabase Setup**
1. Create a new Supabase project
2. Run the migrations in the `supabase/migrations/` folder
3. Set up Row Level Security (RLS) policies
4. Configure authentication providers
5. Set up storage buckets for images

## 🎨 Theming

The app supports both light and dark themes with automatic persistence:

```typescript
// Theme context usage
const { theme, toggleTheme, setTheme } = useTheme();

// Available themes: 'light' | 'dark'
```

## 🔐 Authentication & Authorization

### **User Roles**
- **Regular Users** - Can browse, chat, and purchase
- **Vendors** - Can create and manage product listings
- **Admins** - Full platform access
- **CS Workers** - Customer support access

### **Protected Routes**
- `ProtectedRoute` - Requires authentication
- `VendorProtectedRoute` - Requires vendor profile
- `AdminProtectedRoute` - Requires admin role
- `CSWorkerProtectedRoute` - Requires CS worker role

## 💳 Payment System

### **Subscription Plans**
- **Free** - Basic features
- **Starter** - Enhanced features
- **Standard** - Professional features
- **Rising** - Advanced features
- **Pro** - Premium features
- **Business** - Enterprise features
- **Premium** - Ultimate features

### **Payment Flow**
1. User selects a plan
2. Redirected to Paystack payment
3. Payment verification via webhook
4. Subscription activation
5. Feature access granted

## 📱 Mobile Optimization

The app is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Mobile-specific navigation
- Optimized image loading
- Responsive layouts

## 🚀 Deployment

### **Build for Production**
```bash
npm run build:prod
```

### **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Deploy to Netlify**
```bash
# Build the project
npm run build

# Deploy the dist folder to Netlify
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@bluestore-ghana.com or join our Discord community.

## 🔗 Links

- **Website**: https://bluestore-ghana.com
- **Documentation**: https://docs.bluestore-ghana.com
- **API Reference**: https://api.bluestore-ghana.com/docs

---

Built with ❤️ by the BlueStore Ghana team