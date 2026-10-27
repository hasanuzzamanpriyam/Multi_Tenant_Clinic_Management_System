// This file is automatically compiled by Vite and included in the final build.
// It's the perfect place to bootstrap your application's JavaScript logic.

// Configure Axios for Laravel
import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';

// CSRF Token setup
const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Type declaration for window.axios
declare global {
    interface Window {
        axios: typeof axios;
    }
}