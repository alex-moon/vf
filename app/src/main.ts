import {createApp} from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import {loadFonts} from './plugins/webfontloader';
import {Vf} from "@/ts/vf";
import {View} from "@/ts/view";

loadFonts();

// wire everything up @todo autowiring?
const view = new View();
const vf = new Vf(view);

// bootstrap our app
createApp(App)
  // plugins
  .use(vuetify)

  // services
  .provide('vf', vf)

  // let's go!
  .mount('#app');
