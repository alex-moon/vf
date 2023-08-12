import {createApp} from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import {loadFonts} from './plugins/webfontloader';
import {Vf} from "@/ts/vf";
import {Dev} from "@/ts/dev";

loadFonts();

const vf = new Vf();
const dev = new Dev();

// bootstrap our app
createApp(App)
  // plugins
  .use(vuetify)

  // services
  .provide('vf', vf)
  .provide('dev', dev)

  // let's go!
  .mount('#app');
