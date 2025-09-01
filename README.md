# BlueStore Ghana

Modern e-commerce platform for Ghanaian marketplace built with React, TypeScript, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/BLUESTORE-GHANA/storefront-chat-oasis-44.git
cd storefront-chat-oasis-44

# Install dependencies
npm install

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

### **Dependency Categories**
The project dependencies are organized into logical categories:

- **Core**: React, TypeScript, React Router
- **UI Framework**: Radix UI components, Tailwind CSS
- **Forms & Validation**: React Hook Form, Zod
- **Data Management**: TanStack Query, Supabase
- **Utilities**: Date handling, icons, notifications
- **Analytics**: Charts and reporting

### **Troubleshooting**
If you encounter dependency issues:
```bash
# Clean install
npm run install:clean

# Or manually
rm -rf node_modules package-lock.json
npm install
```

## 🏗️ Architecture
