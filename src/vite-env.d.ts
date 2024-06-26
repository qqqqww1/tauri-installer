/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare global {
  interface HttpResponse<T = unknown> {
    data: T
    success: number
    message?: string
  }
}
