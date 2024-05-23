import { createApp } from 'vue'

import './styles.css'
import App from './App.vue'

import 'uno.css'
import '@unocss/reset/tailwind.css'
import 'src/styles/main.sass'

import { install as installPinia } from 'src/modules/pinia'
import { install as installQuasar } from 'src/modules/quasar'

const app = createApp(App)

installPinia(app)
installQuasar(app)

// 全局注册 Components
const components = import.meta.glob<any>('/src/components/*.vue', { eager: true })
Object.values(components).forEach((component) => {
  app.component(component.default.name, component.default)
})

Object.values(import.meta.glob<any>('/src/components/Function/*.vue', { eager: true })).forEach(
  (component) => {
    app.component(component.default.__name, component.default)
  }
)

app.mount('#app')
