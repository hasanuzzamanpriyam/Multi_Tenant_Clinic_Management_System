import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { InertiaProgress } from '@inertiajs/progress';
import { route } from 'ziggy-js';

import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props, plugin }) {
        // Initialize Ziggy route helper with Laravel route data
        if (typeof window !== 'undefined' && (window as any).Ziggy) {
            route.defaults = (window as any).Ziggy.defaults;
            route.routes = (window as any).Ziggy.routes;
        }
        
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

InertiaProgress.init({
    color: '#4B5563',
    showSpinner: true,
});

// Make route helper globally available
declare global {
    interface Window {
        route: typeof route;
        Ziggy: any;
    }
}

window.route = route;