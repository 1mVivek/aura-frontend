# Aura Frontend

A modern AI chat interface built with React, TypeScript, and Tailwind CSS. Features real-time streaming responses and a sleek dark-themed UI.

## 🚀 Features

- **Real-time Streaming**: AI responses stream in real-time for better user experience
- **Modern UI**: Dark-themed interface with Tailwind CSS
- **TypeScript**: Fully typed for better developer experience and code safety
- **Accessibility**: ARIA labels and semantic HTML for screen reader support
- **Keyboard Navigation**: Press Enter to send messages
- **Auto-scroll**: Automatically scrolls to show the latest messages

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn

## 🏃 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/1mVivek/aura-frontend.git
cd aura-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your API configuration:

```env
VITE_API_URL=https://your-backend-api.com/chat
VITE_API_KEY=your_api_key_here
```

⚠️ **SECURITY WARNING**: See [Security Considerations](#-security-considerations) below.

### 4. Start development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Build

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview production build

```bash
npm run preview
```

## 🔍 Type Checking

Run TypeScript type checking without building:

```bash
npm run type-check
```

## 🚀 Deployment

### Deploying to Render

This project includes a `render.yaml` configuration for easy deployment to [Render](https://render.com).

1. Push your code to a GitHub repository
2. Create a new Static Site on Render
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` configuration
5. Set the following environment variables in the Render dashboard:
   - `VITE_API_URL`: Your backend API endpoint
   - `VITE_API_KEY`: Your API key (see security warning below)

The build will run automatically on each push to your repository.

## 🔐 Security Considerations

### ⚠️ CRITICAL: API Key Security Issue

**The current implementation has a security vulnerability**: The `VITE_API_KEY` environment variable is embedded directly into the client-side JavaScript bundle during build. This means:

- ✅ The API key is visible to anyone who inspects the JavaScript files in the browser
- ✅ Attackers can extract and abuse your API key
- ✅ This is **NOT safe for production**

### 🛡️ Recommended Solution

**Do not put API keys in the frontend.** Instead:

1. **Create a backend proxy/middleware**:
   - Your frontend calls your own backend endpoint (no API key required)
   - Your backend adds the API key server-side when calling the third-party API
   - The API key never leaves your server

2. **Or use proper authentication**:
   - Implement user authentication (JWT, sessions, etc.)
   - Generate short-lived tokens for authenticated users
   - Validate tokens on your backend before making API calls

Example backend proxy (Express.js):

```javascript
app.post('/api/chat', authenticateUser, async (req, res) => {
  const response = await fetch(process.env.AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.AI_API_KEY  // Secret stays on server
    },
    body: JSON.stringify(req.body)
  });
  
  // Stream response back to client
  response.body.pipe(res);
});
```

Then update your frontend to call `/api/chat` instead of the third-party API directly.

## 📁 Project Structure

```
aura-frontend/
├── src/
│   ├── components/
│   │   └── Chat.tsx          # Main chat component
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   ├── index.css             # Tailwind imports
│   └── vite-env.d.ts         # TypeScript environment types
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── render.yaml               # Render deployment configuration
└── .env.example              # Environment variables template
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- API key is currently exposed in the client-side bundle (see Security Considerations)
- No rate limiting on the frontend
- No message history persistence
- No user authentication

## 📮 Support

For issues and questions, please open an issue on GitHub.
