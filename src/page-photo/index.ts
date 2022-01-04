import { createApp } from 'vue'
import App from './app.vue'
import Siroi from './siroi.vue'
createApp(App)
    .component('siroi', Siroi)
    .mount(
        document.getElementById('photo-container').appendChild(document.createElement('div'))
    )