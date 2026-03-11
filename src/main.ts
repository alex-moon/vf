import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './routing';
import { loadFonts } from './plugins/webfontloader';

import { Vf } from '@/ts/vf';

const initApp = async () => {
  await loadFonts();

  const app = createApp(App);

  const vf = new Vf();

  app.use(vuetify);
  app.use(router);

  app.provide('vf', vf);

  app.mount('#app');
};

// Execute the startup
initApp().catch((err) => {
  console.error('Failed to bootstrap the app:', err);
});
