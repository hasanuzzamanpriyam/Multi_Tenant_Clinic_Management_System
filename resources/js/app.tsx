import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { InertiaProgress } from '@inertiajs/progress';
import { route } from 'ziggy-js';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';

import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = 'ClinicPro';

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
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const page = (await resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx')
        )) as any;

        if (
            page.default.layout === undefined &&
            !name.toLowerCase().startsWith('auth/') &&
            name.toLowerCase() !== 'welcome'
        ) {
            page.default.layout = (pageElement: any) => (
                <AuthenticatedLayout>{pageElement}</AuthenticatedLayout>
            );
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#0080FF',
    },
});

InertiaProgress.init({
    color: '#0080FF',
    showSpinner: true,
});
