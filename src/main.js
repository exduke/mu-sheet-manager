import { createApp } from 'vue'
import App from './App.vue'

// createApp(App).mount('#app')

const app = createApp(App)

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
app.use(ElementPlus)

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
   app.component(key, component)
}

app.mount('#app')
