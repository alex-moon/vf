import {createRouter, createWebHistory} from 'vue-router';
import GameCanvas from '@/components/GameCanvas.vue';
import About from '@/components/About.vue';

const routes = [
  { path: '/', component: GameCanvas },
  { path: '/about', component: About },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
