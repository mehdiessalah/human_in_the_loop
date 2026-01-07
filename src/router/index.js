// router/index.js - Vue Router Configuration

import { createRouter, createWebHistory } from 'vue-router';
import DocumentList from '../views/Documentlist.vue';
import DocumentAnnotation from '../views/Documentannotation.vue';
import Dashboard from '../views/Dashboard.vue';
import Models from '../views/Models.vue';

const routes = [
    {
        path: '/',
        name: 'DocumentList',
        component: DocumentList,
        meta: { title: 'Documents' }
    },
    {
        path: '/documents/:id',
        name: 'DocumentAnnotation',
        component: DocumentAnnotation,
        meta: { title: 'Annotate Document' }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Dashboard' }
    },
    {
        path: '/models',
        name: 'Models',
        component: Models,
        meta: { title: 'Models' }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

// Update document title on route change
router.beforeEach((to, from, next) => {
    document.title = to.meta.title
        ? `${to.meta.title} - HITL Document Extractor`
        : 'HITL Document Extractor';
    next();
});

export default router;