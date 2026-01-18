# BlackyFetch Frontend

Modern React frontend for the BlackyFetch intelligent project management system.

## 🚀 Features

- **Real-time Updates**: Socket.IO integration for live ticket updates
- **AI Copilot**: Create tickets using natural language
- **Drag & Drop Kanban**: Intuitive board interface with @hello-pangea/dnd
- **Premium Design**: Glassmorphism, smooth animations, and modern aesthetics
- **TypeScript**: Full type safety throughout the application
- **Responsive**: Works beautifully on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Socket.IO Client** for real-time communication
- **Axios** for API calls
- **@hello-pangea/dnd** for drag-and-drop
- **CSS Modules** for scoped styling

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

The frontend expects the backend to be running on `http://localhost:5000`. If your backend is on a different URL, create a `.env` file:

```env
VITE_API_URL=http://your-backend-url:port
```

## 🎨 Design System

The app uses a comprehensive design system with:
- Premium color palette with gradients
- Consistent spacing scale
- Modern typography (Inter & Outfit fonts)
- Glassmorphism effects
- Smooth animations and transitions

## 📱 Pages

- **Dashboard**: Overview with stats and recent tickets
- **Board**: Kanban board with drag-and-drop functionality
- **Settings**: Configuration (coming soon)

## 🤖 AI Copilot

Click the floating AI button in the bottom-right corner to create tickets using natural language. The AI will parse your message and create a structured ticket automatically.

## 🔄 Real-time Updates

The app automatically updates when:
- New tickets are created
- Tickets are moved between columns
- Tickets are assigned to users

No page refresh needed!

## 📝 Development

The project structure:
```
src/
├── api/              # API client and services
├── components/       # Reusable React components
├── contexts/         # React contexts (Auth, Socket)
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── styles/          # Global styles and design system
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## 🚢 Deployment

Build the production bundle:
```bash
npm run build
```

The `dist/` folder will contain the optimized production build ready for deployment.

## 📄 License

Part of the BlackyFetch project.
