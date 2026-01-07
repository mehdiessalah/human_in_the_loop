# HITL Document Extraction - Frontend

Vue.js 3 frontend application for Human-in-the-Loop document annotation and correction interface.

## Overview

This frontend provides an intuitive web interface for document upload, field extraction visualization, correction annotation, and model performance monitoring. Built with Vue.js 3 using the Composition API.

## Features

-  **Document Upload** - Drag-and-drop interface for uploading invoices and receipts
- ️ **Visual Annotation** - Split-view interface with document viewer and field editor
- ️ **Interactive Corrections** - Easy-to-use correction interface with validation
-  **Performance Dashboard** - Real-time metrics and statistics visualization
-  **Model Management** - View model versions and trigger retraining
-  **Responsive Design** - Works on desktop and tablet devices
-  **Real-time Updates** - Automatic data refresh and state management

## Prerequisites

- **Node.js 18** or higher
- **npm** or **yarn** package manager
- **Backend API** running (see backend README)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mehdiessalah/human_in_the_loop.git
cd hitl-document-extraction/frontend
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Configure Environment Variables

Create a `.env` file in the frontend directory:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000

```

**Environment Variables:**

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | Yes | `http://localhost:8000` |

## Usage

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will start at `http://localhost:3000` (or next available port)

**Vite will display:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
  ➜  press h to show help
```

### Production Build

Build the application for production:

```bash
npm run build
```

Output will be in the `dist/` directory.



## Application Structure

### Main Pages

#### 1. Dashboard (`/`)
- Overview statistics (total documents, corrections, confidence)
- Correction statistics table by field type
- Model performance timeline
- Quick actions and navigation

#### 2. Document List (`/documents`)
- Tabular view of all documents
- Filter by status (pending, in_progress, completed)
- Filter by document type (invoice, receipt)
- Upload new documents
- Quick actions (view, extract, delete)

#### 3. Document Annotation (`/documents/:id/annotate`)
- **Left Panel:** Document image viewer with zoom controls
- **Right Panel:** Field editor with correction interface
- Bounding box visualization (color-coded)
- Session timer and progress tracking
- Auto-save corrections

#### 4. Model Management (`/models`)
- Active model information and metrics
- Model version history table
- Training trigger button
- Model activation controls

## Project Structure

```
frontend/
├── public/                      # Static assets
│   └── favicon.ico
├── src/
│   ├── assets/                  # Images, styles, fonts
│   │   └── styles/
│   │       └── main.css
│   ├── components/              # Vue components
│   │   ├── Dashboard.vue
│   │   ├── DocumentList.vue
│   │   ├── DocumentAnnotation.vue
│   │   ├── Models.vue
│   │   ├── Navbar.vue
│   │   └── UploadModal.vue
│   ├── router/                  # Vue Router configuration
│   │   └── index.js
│   ├── services/                # API service layer
│   │   └── api.js
│   ├── utils/                   # Utility functions
│   │   └── helpers.js
│   ├── App.vue                  # Root component
│   └── main.js                  # Application entry point
├── .env                         # Environment variables (create this)
├── .env.example                # Environment template
├── .gitignore
├── index.html                   # HTML entry point
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── Dockerfile                   # Docker configuration
└── README.md                    # This file
```

## Useful Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```
