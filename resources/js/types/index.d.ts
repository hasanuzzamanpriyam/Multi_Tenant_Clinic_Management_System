// Inertia.js TypeScript declarations
declare module '@inertiajs/core' {
    import { ComponentType } from 'react';

    interface PageProps {
        [key: string]: any;
    }

    interface InertiaPage {
        component: string | ComponentType<any>;
        props: PageProps;
        url: string;
        version: string;
        clearHistory?: boolean;
        encryptHistory?: boolean;
    }

    interface VisitOptions {
        method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
        data?: Record<string, any>;
        replace?: boolean;
        preserveState?: boolean;
        preserveScroll?: boolean;
        only?: string[];
        except?: string[];
        headers?: Record<string, string>;
        onStart?: (visit: Visit) => void;
        onProgress?: (progress: ProgressEvent) => void;
        onSuccess?: (page: Page) => void;
        onError?: (errors: Record<string, string[]>) => void;
        onCancel?: () => void;
        onFinish?: () => void;
    }

    interface Visit {
        url: string;
        method: string;
        data: Record<string, any>;
    }

    interface Page {
        component: string;
        props: PageProps;
        url: string;
        version: string;
    }

    interface Inertia {
        visit(url: string, options?: VisitOptions): void;
        get(url: string, options?: VisitOptions): void;
        post(url: string, options?: VisitOptions): void;
        put(url: string, options?: VisitOptions): void;
        patch(url: string, options?: VisitOptions): void;
        delete(url: string, options?: VisitOptions): void;
        reload(options?: VisitOptions): void;
        replace(url: string, options?: VisitOptions): void;
        remember(key: string, value: any): void;
        restore(key: string): any;
    }

    const Inertia: Inertia;

    export function usePage<T extends PageProps = PageProps>(): T;
    export function useForm<T extends Record<string, any>>(initialData: T): {
        data: T;
        setData: (data: T | ((data: T) => T)) => void;
        errors: Record<string, string>;
        processing: boolean;
        progress: ProgressEvent | null;
        wasSuccessful: boolean;
        recentlySuccessful: boolean;
        validate: () => Promise<void>;
        submit: (method: string, url: string, options?: VisitOptions) => void;
        get: (url: string, options?: VisitOptions) => void;
        post: (url: string, options?: VisitOptions) => void;
        put: (url: string, options?: VisitOptions) => void;
        patch: (url: string, options?: VisitOptions) => void;
        delete: (url: string, options?: VisitOptions) => void;
        reset: (...keys: string[]) => void;
        clearErrors: (...keys: string[]) => void;
    };

    export function Head(props: { title?: string; children?: React.ReactNode }): React.ReactElement | null;
    export function Link(props: { href: string; method?: string; as?: string; children: React.ReactNode; replace?: boolean; preserveState?: boolean; preserveScroll?: boolean; }): React.ReactElement;
}

declare module '@inertiajs/react' {
    import { ComponentType, ReactNode } from 'react';

    export interface InertiaPageProps {
        component: ComponentType<any> | string;
        props: Record<string, any>;
        url: string;
        version: string;
    }

    export function usePage<T extends Record<string, any> = Record<string, any>>(): T;

    export const Head: ComponentType<{ title?: string; children?: ReactNode }>;
    export const Link: ComponentType<{ href: string; method?: string; as?: string; children: ReactNode; replace?: boolean; preserveState?: boolean; preserveScroll?: boolean; }>;

    export const Inertia: {
        visit: (url: string, options?: any) => void;
        get: (url: string, options?: any) => void;
        post: (url: string, options?: any) => void;
        put: (url: string, options?: any) => void;
        patch: (url: string, options?: any) => void;
        delete: (url: string, options?: any) => void;
        reload: (options?: any) => void;
        replace: (url: string, options?: any) => void;
    };

    export function useForm<T extends Record<string, any>>(initialData: T): {
        data: T;
        setData: (data: T | ((data: T) => T)) => void;
        errors: Record<string, string>;
        processing: boolean;
        progress: ProgressEvent | null;
        wasSuccessful: boolean;
        recentlySuccessful: boolean;
        validate: () => Promise<void>;
        submit: (method: string, url: string, options?: any) => void;
        get: (url: string, options?: any) => void;
        post: (url: string, options?: any) => void;
        put: (url: string, options?: any) => void;
        patch: (url: string, options?: any) => void;
        delete: (url: string, options?: any) => void;
        reset: (...keys: string[]) => void;
        clearErrors: (...keys: string[]) => void;
    };
}

declare module 'ziggy-js' {
    export interface RouteHelpers {
        [key: string]: (params?: any, absolute?: boolean) => string;
    }

    export function route(name: string, params?: any, absolute?: boolean): string;

    export const Ziggy: {
        location: string;
        defaults: any;
        routes: any;
    };

    export default function ZiggyVue(app: any, options: any): void;
}

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    [key: string]: string | boolean | undefined;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Extend Window for Inertia
interface Window {
    Inertia: any;
}