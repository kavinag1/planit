# Planit - AI-Powered Productivity Assistant

Planit is an intelligent productivity web application that helps you organize, prioritize, and execute your tasks with AI assistance. Built as a responsive web app (PWA) that works on desktop and iPhone, it transforms your scattered thoughts into an organized, actionable task plan.

## What Planit Does

### Brain Dump Input
Simply type or paste your thoughts, ideas, and tasks without worrying about structure. Planit's AI instantly parses your brain dump and extracts actionable tasks.

### Intelligent Task Management
- **Smart Extraction**: Automatically identifies task title, deadline, priority, time estimate, and category
- **Task Board**: Organize tasks by status with drag-and-drop columns
- **Subtasks & Dependencies**: AI generates helpful subtasks and manage task dependencies
- **Smart Filtering**: Filter and search tasks by priority, category, date, or custom tags

### Dynamic Planning Engine
- **Daily Planner**: Auto-generates optimized daily schedules based on task priorities and estimates
- **Workload Management**: Visual weekly heatmap showing your workload distribution
- **Smart Rescheduling**: Automatically reschedules overdue tasks while maintaining priorities
- **Deadline Intelligence**: Alerts and prevents deadline conflicts

### Productivity Dashboard
- **Pomodoro Timer**: Focus, short break, and long break cycles with progress ring
- **Focus Mode Overlay**: Full-screen distraction-light timer view with quick presets
- **Goals & Habit Tracking**: Track custom goals and daily habit streaks
- **Analytics & History**: Status/priority breakdowns and recent activity logs
- **Ambient Sound Controls Removed**: Dashboard and Focus Mode no longer include built-in ambience audio toggles

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Firebase (Firestore, Authentication, Analytics)
- **AI**: Google Gemini API with intelligent local parsing fallback
- **Calendar**: Google Calendar integration
- **PWA**: Vite PWA plugin with offline caching

## Getting Started

### Environment Setup

Create a `.env.local` file in the project root with your API credentials:

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_CALENDAR_CLIENT_ID=your_google_calendar_client_id
```

### Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Deployment

### Firebase Hosting

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login and initialize:

```bash
firebase login
firebase init hosting
```

3. Set `dist` as the public directory and configure SPA rewrite to `/index.html`

4. Deploy:

```bash
npm run build
firebase deploy
```

## Browser Support

Planit works best on modern browsers:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)
