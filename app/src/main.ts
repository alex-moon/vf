import 'vuetify/styles'
import {createApp} from 'vue'

import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {loadFonts} from "@/plugins/webfontloader";
loadFonts()

import * as vf from './plugins/vf'
import App from './App.vue'

const app = createApp(App);
const vuetify = createVuetify({
    components,
    directives,
});

app
    .use(vuetify)
    .provide('vf', vf)
    .mount('#app')
