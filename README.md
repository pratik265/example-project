# Modern Healthcare Website Template

A cutting-edge healthcare website template built with Next.js frontend and Node.js/Express backend. This template provides a comprehensive solution for healthcare providers, featuring modern design, advanced functionality, and excellent performance.

## Features

- **Modern Tech Stack**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Advanced Doctor Profiles**: Rich profiles with specialties, availability, and reviews
- **Smart Clinic Locations**: Interactive maps, real-time availability, and virtual tours
- **Treatment Catalog**: Detailed treatment information with pricing and insurance details
- **Patient Portal**: Secure patient access to medical records and appointments
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Dark Mode**: Built-in dark mode support
- **Internationalization**: Multi-language support out of the box
- **Performance Optimized**: Fast loading times and SEO friendly

## Tech Stack

### Frontend
- Next.js 14 (React Framework)
- TypeScript
- Tailwind CSS
- Shadcn/ui (Component Library)
- React Query (Data Fetching)
- Zustand (State Management)
- i18next (Internationalization)
- Framer Motion (Animations)

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma (ORM)
- PostgreSQL
- JWT Authentication
- Swagger (API Documentation)
- Jest (Testing)

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # Reusable components
│   │   ├── lib/          # Utility functions
│   │   ├── styles/       # Global styles
│   │   └── types/        # TypeScript types
│   ├── public/           # Static assets
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic
│   ├── prisma/          # Database schema
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd healthcare-template
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   pnpm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   pnpm install
   ```

4. **Set up Environment Variables**
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env.local
   
   # Backend
   cp backend/.env.example backend/.env
   ```

5. **Set up Database**
   ```bash
   cd backend
   pnpm prisma migrate dev
   ```

### Development

1. **Start Backend Server**
   ```bash
   cd backend
   pnpm dev
   ```

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   pnpm dev
   ```

3. Visit `http://localhost:3000`

## Key Features

### Modern UI Components
- Responsive navigation
- Hero sections with animations
- Card layouts for doctors and treatments
- Interactive forms with validation
- Loading states and error handling
- Toast notifications
- Modal dialogs

### Advanced Functionality
- Real-time appointment scheduling
- Doctor availability calendar
- Patient medical history
- Prescription management
- Insurance verification
- Payment processing
- Video consultations

### Security Features
- JWT authentication
- Role-based access control
- Data encryption
- Rate limiting
- Input validation
- XSS protection
- CSRF protection

### Performance Optimizations
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies
- API request batching
- Database indexing
- CDN integration

## Customization

### Theme Customization
- Color schemes
- Typography
- Component styles
- Layout options
- Animation settings

### Content Management
- Doctor profiles
- Treatment information
- Clinic details
- Pricing tables
- Insurance information
- FAQ content

## Deployment

### Frontend Deployment
```bash
cd frontend
pnpm build
```

### Backend Deployment
```bash
cd backend
pnpm build
```

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS 13+, Android 10+)

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the development team. 