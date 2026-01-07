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

# Optional: Other configurations
VITE_APP_TITLE=HITL Document Extraction
VITE_MAX_FILE_SIZE=10485760
```

**Environment Variables:**

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | Yes | `http://localhost:8000` |
| `VITE_APP_TITLE` | Application title | No | `HITL Document Extraction` |
| `VITE_MAX_FILE_SIZE` | Max upload size in bytes | No | `10485760` (10MB) |

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

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

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

### Key Components

#### Dashboard.vue
Main dashboard with statistics and metrics:
```vue
<template>
  <div class="dashboard">
    <StatisticsCards />
    <CorrectionStatsTable />
    <ModelPerformanceChart />
  </div>
</template>
```

#### DocumentList.vue
Document management interface:
```vue
<template>
  <div class="document-list">
    <FilterBar />
    <DocumentTable />
    <UploadModal />
  </div>
</template>
```

#### DocumentAnnotation.vue
Split-view annotation interface:
```vue
<template>
  <div class="annotation-view">
    <DocumentViewer />
    <FieldEditor />
    <SessionTimer />
  </div>
</template>
```

#### Models.vue
Model version management:
```vue
<template>
  <div class="models-page">
    <ActiveModelCard />
    <ModelVersionTable />
    <TrainingControls />
  </div>
</template>
```

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

## API Integration

### API Service (`services/api.js`)

Centralized API client using Axios:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Documents
export const uploadDocument = (file, documentType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  return api.post('/api/documents/upload-and-extract', formData);
};

export const getDocuments = (filters) => {
  return api.get('/api/documents', { params: filters });
};

export const getDocument = (id) => {
  return api.get(`/api/documents/${id}`);
};

// Corrections
export const saveCorrection = (correction) => {
  return api.post('/api/corrections', correction);
};

export const getCorrections = (documentId) => {
  return api.get(`/api/corrections/document/${documentId}`);
};

// Models
export const getModels = () => {
  return api.get('/api/models');
};

export const trainModel = () => {
  return api.post('/api/models/train');
};
```

### Using API in Components

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { getDocuments } from '@/services/api';

const documents = ref([]);
const loading = ref(false);

const fetchDocuments = async () => {
  loading.value = true;
  try {
    const response = await getDocuments();
    documents.value = response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDocuments();
});
</script>
```

## Routing

Routes are defined in `router/index.js`:

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/components/Dashboard.vue';
import DocumentList from '@/components/DocumentList.vue';
import DocumentAnnotation from '@/components/DocumentAnnotation.vue';
import Models from '@/components/Models.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/documents',
    name: 'DocumentList',
    component: DocumentList,
  },
  {
    path: '/documents/:id/annotate',
    name: 'DocumentAnnotation',
    component: DocumentAnnotation,
  },
  {
    path: '/models',
    name: 'Models',
    component: Models,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

## Styling

### Global Styles

Main styles are in `src/assets/styles/main.css`:

```css
/* Variables */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --background: #f5f5f5;
  --card-bg: #ffffff;
  --text-primary: #2c3e50;
  --border-color: #ddd;
}

/* Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Cards */
.card {
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}
```

### Component-Scoped Styles

Use scoped styles in components:

```vue
<style scoped>
.annotation-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: calc(100vh - 80px);
}

.document-viewer {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.field-editor {
  overflow-y: auto;
  padding: 20px;
}
</style>
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t hitl-frontend:latest .
```

### Run Docker Container

```bash
docker run -d \
  --name hitl-frontend \
  -p 3000:3000 \
  -e VITE_API_BASE_URL=http://localhost:8000 \
  hitl-frontend:latest
```

### Dockerfile

The provided Dockerfile uses multi-stage build:

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Using Docker Compose

Create `docker-compose.yml` in the frontend directory:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

### Convenience Script

Create `run.sh`:

```bash
#!/bin/bash
echo "🚀 Starting HITL Frontend..."

# Check if backend is running
if ! curl -s http://localhost:8000 > /dev/null; then
    echo "⚠️  Warning: Backend not running at http://localhost:8000"
    echo "   Please start backend first"
fi

docker-compose up -d
echo "✅ Frontend running at http://localhost:3000"
```

Make executable and run:
```bash
chmod +x run.sh
./run.sh
```

## Development Guidelines

### Vue 3 Composition API

Use the Composition API for new components:

```vue
<script setup>
import { ref, computed, onMounted } from 'vue';

// Reactive state
const count = ref(0);
const items = ref([]);

// Computed properties
const doubleCount = computed(() => count.value * 2);

// Methods
const increment = () => {
  count.value++;
};

// Lifecycle hooks
onMounted(() => {
  console.log('Component mounted');
});
</script>
```

### State Management

For simple state, use composition functions:

```javascript
// composables/useDocuments.js
import { ref } from 'vue';

export function useDocuments() {
  const documents = ref([]);
  const loading = ref(false);
  
  const fetchDocuments = async () => {
    loading.value = true;
    // Fetch logic
    loading.value = false;
  };
  
  return {
    documents,
    loading,
    fetchDocuments
  };
}
```

Use in components:
```vue
<script setup>
import { useDocuments } from '@/composables/useDocuments';

const { documents, loading, fetchDocuments } = useDocuments();
</script>
```

## Troubleshooting

### Backend Connection Issues

**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution:**
```bash
# 1. Verify backend is running
curl http://localhost:8000

# 2. Check VITE_API_BASE_URL in .env
cat .env

# 3. Ensure backend URL is correct
# For local dev: http://localhost:8000
# For Docker: http://backend:8000

# 4. Check CORS settings in backend
# Backend should allow frontend origin
```

### Build Errors

**Error:** `Module not found` or `Cannot resolve`

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find process using port
# Linux/Mac:
lsof -i :3000
# Windows:
netstat -ano | findstr :3000

# Kill process or use different port
npm run dev -- --port 3001
```

### Environment Variables Not Loading

**Error:** `import.meta.env.VITE_API_BASE_URL is undefined`

**Solution:**
```bash
# 1. Ensure .env file exists
ls -la .env

# 2. Verify variables start with VITE_
cat .env

# 3. Restart dev server (required after .env changes)
# Stop server (Ctrl+C) and restart
npm run dev
```

### Image/Asset Not Found

**Error:** `Failed to load resource` for images

**Solution:**
```javascript
// Use proper import for images
import logo from '@/assets/logo.png';

// Or use public folder for static assets
// Place in public/ folder and reference as /filename.png
<img src="/logo.png" alt="Logo">
```

## Performance Optimization

### Code Splitting

Use lazy loading for routes:

```javascript
const routes = [
  {
    path: '/documents',
    component: () => import('@/components/DocumentList.vue')
  }
];
```

### Image Optimization

Optimize images before upload:
```javascript
const optimizeImage = async (file) => {
  // Resize large images client-side
  const maxWidth = 1920;
  const maxHeight = 1080;
  // Implementation...
};
```

### Debouncing

Debounce search inputs:
```javascript
import { ref } from 'vue';
import { debounce } from 'lodash-es';

const searchQuery = ref('');
const search = debounce((query) => {
  // Search logic
}, 300);
```

## Testing

### Component Testing

Example using Vue Test Utils:

```javascript
import { mount } from '@vue/test-utils';
import Dashboard from '@/components/Dashboard.vue';

describe('Dashboard.vue', () => {
  it('renders statistics', () => {
    const wrapper = mount(Dashboard);
    expect(wrapper.find('.stats').exists()).toBe(true);
  });
});
```

### E2E Testing

Add Cypress for E2E tests:

```bash
npm install -D cypress
npx cypress open
```

## Browser Support

- **Chrome/Edge:** Latest 2 versions
- **Firefox:** Latest 2 versions
- **Safari:** Latest 2 versions

## Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast compliance (WCAG AA)

## Contributing

1. Follow Vue.js style guide
2. Use ESLint and Prettier
3. Write meaningful commit messages
4. Test changes in multiple browsers
5. Update README for new features

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

# Type check (if using TypeScript)
npm run type-check
```

## Dependencies

```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "vite": "^5.0.0"
  }
}
```

## Support

For issues or questions:
- Check browser console for errors
- Review the [Backend README](../backend/README.md)
- Review the [full project report](../report.pdf)
- Open an issue on GitHub

## License

This project is part of an MLOps course assignment.

---

**Built with Vue.js 3 and Vite - January 2026**