import {createApp} from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import {loadFonts} from './plugins/webfontloader';
import Vf from "@/ts/vf";

loadFonts();

const vf = new Vf();

// bootstrap our app
createApp(App)
  // plugins
  .use(vuetify)

  // services
  .provide('vf', vf)

  // let's go!
  .mount('#app');
