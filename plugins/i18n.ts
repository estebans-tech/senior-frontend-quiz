import { defineNuxtPlugin } from 'nuxt/app'
import { createI18n } from 'vue-i18n'
import en from '~/i18n/locales/en.json'
import sv from '~/i18n/locales/sv.json'

export default defineNuxtPlugin((nuxtApp) => {
  const cookie = useCookie<string>('locale', { path: '/' })
  const startLocale = cookie.value || 'en'

  const i18n = createI18n({
    legacy: false,
    locale: startLocale,
    fallbackLocale: 'en',
    messages: { en, sv },
    globalInjection: true
  })
  
  nuxtApp.vueApp.use(i18n)

  useHead({ htmlAttrs: { lang: startLocale } })
  
  return {
    provide: {
      i18n
    }
  }
})
