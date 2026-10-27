# Contributing to PrivaPDF 🛡️

Thank you for your interest in contributing to PrivaPDF! We welcome contributions that maintain our core commitment: **100% offline, privacy-first document processing with zero data leakage**.

---

## 🛠️ Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or later
- npm v9+

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/djakamiriandi/PrivaPDF.git
   cd PrivaPDF
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. Test Electron desktop app:
   ```bash
   npm run electron:start
   ```

5. Production Build:
   ```bash
   npm run build
   ```

---

## 📋 Architectural Principles & Guidelines

1. **Client-Side Only**: All converters must run 100% inside client browser memory (`ArrayBuffer`, `Canvas`, `Wasm`). Never introduce backend servers or remote API dependencies.
2. **Zero Telemetry**: Do not add Google Analytics, tracking pixels, error monitoring SDKs (like Sentry), or outbound HTTP requests.
3. **Strict Content Security Policy**: `connect-src 'none'` must never be relaxed or bypassed.
4. **Memory Hygiene**: Always release binary URLs with `URL.revokeObjectURL()` after download triggers.
5. **Modern TypeScript**: Keep type definitions strict without resorting to `any` where possible.

---

## 🔀 Submitting a Pull Request

1. Fork the repository and create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. Verify TypeScript type checking and production build:
   ```bash
   npm run build
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request on GitHub.
