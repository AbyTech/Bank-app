// Legacy alias - the single source of truth for the axios instance is
// services/api.jsx (used everywhere across the app). This module previously
// held its own diverging base URL; re-exporting the shared instance guarantees
// every consumer points at the exact same configured backend.
export { default } from './services/api';
