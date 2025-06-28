https://github.com/SoradDynamics/Sorad-Demo_Remix# SORAD - School Management System

![SORAD Logo](/public/ico.png)

## 🌟 Overview

SORAD is a comprehensive school management system built with modern web technologies. It's designed to streamline educational administration by providing an integrated platform for administrators, teachers, students, parents, and other school staff.

The platform offers specialized interfaces for each user role:

- **Administrators**: Manage school operations, classes, and staff
- **Teachers**: Handle attendance, assignments, lesson plans, and student reviews
- **Students**: Access learning materials, assignments, and view their performance
- **Parents**: Monitor their children's progress, view lesson plans, and interact with teachers
- **Library Staff**: Manage library resources
- **Drivers**: Handle transportation logistics

## 🚀 Key Features

- **Multi-Role Access**: Tailored interfaces for administrators, teachers, students, parents, drivers, library staff, and camera operators
- **School Administration**: Manage student enrollment, class assignments, and staff management
- **Academic Management**: Create and track lesson plans, assignments, and student reviews
- **Attendance Tracking**: Record and monitor student and teacher attendance
- **Learning Resources**: Share notes, lesson materials, and create a digital repository
- **Gallery Management**: Upload and organize photos and media content
- **Library Management**: Track books and resources
- **Transportation**: Monitor driver locations and manage transport logistics
- **License Management**: School licensing system with expiration tracking
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🛠️ Technologies Used

### Frontend

- [Remix 2](https://remix.run/docs/en/main/start/quickstart): Modern React framework
- [HeroUI v2](https://heroui.com/): UI component library
- [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework
- [Tailwind Variants](https://tailwind-variants.org): Variant API for Tailwind
- [TypeScript](https://www.typescriptlang.org/): Type-safe JavaScript
- [Framer Motion](https://www.framer.com/motion/): Animation library
- [React](https://react.dev/): JavaScript UI library
- [Zustand](https://github.com/pmndrs/zustand): State management solution

### Backend & Services

- [Appwrite](https://appwrite.io/): Backend-as-a-Service platform
  - Authentication
  - Database
  - Storage
  - Functions
- [Tauri](https://tauri.app/): Framework for building desktop applications
- [Leaflet](https://leafletjs.com/): Interactive maps

### Data Visualization

- [Chart.js](https://www.chartjs.org/): JavaScript charting library
- [Recharts](https://recharts.org/): Composable charting library

### Form Handling

- [React Hook Form](https://react-hook-form.com/): Form validation
- [Zod](https://zod.dev/): TypeScript-first schema validation

## 🏗️ Project Structure

- `app/`: Core application files
  - `routes/`: Application routes
  - `context/`: React context providers
  - `store/`: Zustand state stores
  - `utils/`: Utility functions and services
  - `hooks/`: Custom React hooks
- `components/`: UI components
  - `common/`: Shared components
  - `pages/`: Page-specific components
- `public/`: Static assets
- `types/`: TypeScript type definitions

## 📋 Prerequisites

- Node.js 20.0.0 or higher
- pnpm 9.12.3 or higher (recommended)

## 🚦 Getting Started

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd sorad-demo-school
```

2. Install dependencies using pnpm:

```bash
pnpm install
```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:

```
VITE_APPWRITE_ENDPOINT=your_appwrite_endpoint
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
```

### Development

Run the development server:

```bash
pnpm dev
```

### Build for Production

Build the project:

```bash
pnpm build
```

Serve the built application:

```bash
pnpm start
```

## 🧪 Type Checking

Run TypeScript type checking:

```bash
pnpm typecheck
```

## 🔍 Linting

Lint the project:

```bash
pnpm lint
```

## 📦 PNPM Configuration

If you're using pnpm, add the following to your `.npmrc` file:

```
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, run `pnpm install` again to ensure dependencies are installed correctly.

## 🔑 Authentication

The system uses Appwrite's authentication service. Users are assigned role-based access through labels:

- `admin`: School administrators
- `teacher`: Teaching staff
- `student`: Students
- `parent`: Parents or guardians
- `driver`: Transportation staff
- `library`: Library staff
- `camera`: Camera operators
- `manage`: System managers

## 🌐 License Management

Schools are managed through a licensing system that tracks validity and expiration. The system can display appropriate messages for expired licenses.

## 📱 Responsive Design

The application is designed to work on both desktop and mobile devices, with appropriate layouts for different screen sizes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check issues page if you want to contribute.

## 📄 License

This project is proprietary software. All rights reserved.

© 2025 SORAD Tech
