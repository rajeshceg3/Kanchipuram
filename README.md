# Kanchipuram: A Contemplation of Form

## Mission Profile
This repository hosts a high-performance, secure, and accessible interactive map visualization of the sacred temples of Kanchipuram. The application is engineered for production readiness, focusing on code quality, security, and user experience.

## Architecture & Technology Stack

### Core Technologies
- **Language:** Vanilla JavaScript (ES Modules)
- **Styling:** CSS3 with CSS Variables & Animations (No preprocessors for zero-config simplicity)
- **Map Engine:** Leaflet.js
- **Build Tool:** Vite
- **Testing:** Vitest (Unit), Playwright (E2E)
- **Linting:** ESLint, Prettier

### Modules
The application is architected using a modular design pattern to ensure separation of concerns and maintainability:

1.  **`main.js`**: The entry point. acts as the orchestrator, initializing the application and wiring together the managers.
2.  **`MapManager.js`**: Encapsulates all Leaflet.js logic. Handles map initialization, marker creation, tile layers, and camera movements.
3.  **`UIManager.js`**: Manages the DOM, including the list view, loader, error banners, and interactions.
4.  **`DataManager.js`**: Abstraction layer for data retrieval. Currently serves static data but is designed to support async API calls.

## Security Protocol

- **Content Security Policy (CSP):** Strict CSP is enforced. No `unsafe-inline` scripts or styles are permitted. All assets must be loaded from trusted sources (Self, Unpkg, Google Fonts, CartoDB).
- **Dependency Management:** All dependencies are vetted and updated to avoid vulnerabilities.
- **Sanitization:** All user/data content injected into the DOM is sanitized using `DOMPurify` (via utils) to prevent XSS.

## Operational Guide

### Prerequisites
- Node.js v20+
- npm v10+

### Installation
```bash
npm install
```

### Development
Start the local development server:
```bash
npm run dev
```

### Building for Production
Create an optimized production build:
```bash
npm run build
```
Artifacts will be generated in the `dist/` directory.

### Testing
**Unit Tests:**
Run the Vitest suite to verify logic:
```bash
npm test
```

**End-to-End Tests:**
Run Playwright tests to verify critical user flows:
```bash
npx playwright install --with-deps
npm run test:e2e
```

### Linting
Ensure code compliance:
```bash
npm run lint
```

## User Experience Features
- **Responsive Design:** Fully responsive layout adapting to mobile and desktop viewports.
- **Performance:** Optimized asset loading, CSS animations for 60fps performance, and lazy initialization.
- **Accessibility:** Semantic HTML, ARIA roles, and keyboard navigation support.
- **Resilience:** Network error handling and retry mechanisms (visual feedback).

## Deployment
The `dist/` folder contains static assets ready for deployment to any static host (Netlify, Vercel, AWS S3, etc.).
Ensure your web server adds the appropriate `Content-Security-Policy` headers if not already handled by the HTML meta tag.
