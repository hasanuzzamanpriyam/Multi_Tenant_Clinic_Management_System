import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { InertiaProgress } from '@inertiajs/progress';
import { route } from 'ziggy-js';

import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Make route helper globally available
declare global {
    var route: typeof route;
    interface Window {
        route: typeof route;
        Ziggy: any;
    }
}

if (typeof window !== 'undefined') {
    window.route = route;
    (globalThis as any).route = route;
    if ((window as any).Ziggy) {
        (route as any).defaults = (window as any).Ziggy.defaults;
        (route as any).routes = (window as any).Ziggy.routes;
    }
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
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