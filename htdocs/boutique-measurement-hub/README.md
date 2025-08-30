# Boutique Measurement Hub

A comprehensive boutique measurement and order management system for tailors and fashion designers. This application helps manage customer measurements, blouse details, and order tracking for boutique businesses.

## 🚀 Features

- **Customer Management**: Add and manage customer profiles with detailed measurements
- **Measurement Tracking**: Comprehensive measurement system for blouse fitting
- **Image Management**: Upload and manage customer images (saree, blouse designs)
- **Order Status Tracking**: Track orders from pending to delivery
- **Admin Dashboard**: Complete overview of all customers and orders
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live updates for order status changes

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Testing**: Vitest, React Testing Library
- **Code Quality**: ESLint, Prettier, Husky

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/boutique-measurement-hub.git
cd boutique-measurement-hub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and configure your variables:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your configuration:

```env
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration (for future use)
DATABASE_URL=your_database_url_here

# Authentication
JWT_SECRET=your_jwt_secret_here

# File Upload (for future use)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# App Configuration
NODE_ENV=development
VITE_APP_NAME=Boutique Measurement Hub
VITE_APP_VERSION=1.0.0
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
boutique-measurement-hub/
├── components/          # Reusable UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services and utilities
├── utils/              # Utility functions
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.html          # HTML template
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

### Docker

1. Build the Docker image:
```bash
docker build -t boutique-measurement-hub .
```

2. Run the container:
```bash
docker run -p 3000:3000 boutique-measurement-hub
```

## 📱 Usage

### For Customers

1. **Login/Sign Up**: Enter your phone number to access your profile
2. **Complete Profile**: Add your name and contact information
3. **Add Measurements**: Enter your detailed body measurements
4. **Upload Images**: Add photos of your saree and blouse preferences
5. **Track Orders**: Monitor your order status and updates

### For Admins

1. **Admin Login**: Access the admin dashboard
2. **Customer Overview**: View all customer profiles and orders
3. **Order Management**: Update order status and track progress
4. **Measurement Review**: Review and approve customer measurements
5. **Image Management**: Manage customer uploaded images

## 🔒 Security Features

- Input validation and sanitization
- Secure authentication system
- Protected routes and API endpoints
- Environment variable protection
- XSS and CSRF protection

## 🎨 Customization

### Styling

The application uses Tailwind CSS for styling. You can customize the design by:

1. Modifying `tailwind.config.js`
2. Updating color schemes in the configuration
3. Adding custom components in `index.css`

### Configuration

- Update `vite.config.ts` for build configuration
- Modify `tsconfig.json` for TypeScript settings
- Adjust ESLint rules in `eslint.config.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/boutique-measurement-hub/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Customer and admin dashboards
- Measurement management system
- Image upload functionality
- Order tracking system

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Vite for the fast build tool
- All contributors and supporters

---

**Made with ❤️ for boutique businesses**
