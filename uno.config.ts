import { defineConfig } from 'unocss'
import {
  presetUno,
  presetIcons,
  transformerVariantGroup,
  presetAttributify,
  transformerDirectives
} from 'unocss'
import { presetScrollbar } from 'unocss-preset-scrollbar'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block'
      }
    }),
    presetScrollbar()
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()]
})
