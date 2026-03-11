import { createRouter, createWebHistory } from 'vue-router';

const GameCanvas = () => import('@/components/GameCanvas.vue');
const About = () => import('@/components/About.vue');

const routes = [
  {
    path: '/',
    name: 'play',
    component: GameCanvas
  },
  {
    path: '/about',
    name: 'about',
    component: About
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
