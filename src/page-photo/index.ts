import { createApp } from 'vue'
import App from './app.vue'
import Siroi from './siroi.vue'

const container = document.getElementById('photo-container')
const id = container.dataset.id
createApp({
    ...App, data: () => ({
        id,
        imgs: null,
        showError: false,
    }),
})
    .component('siroi', Siroi)
    .mount(container)