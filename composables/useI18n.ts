import { useCookie, useHead } from "nuxt/app"
import { useI18n } from "vue-i18n"

export function useLocaleSwitcher() {
  const { locale, setLocaleMessage } = useI18n({ useScope: 'global' })
  const cookie = useCookie<string>('locale', { 
    path: '/',
    default: () => 'en',
    sameSite: 'lax'
  })

  // Initialize locale from cookie
  if (process.client && cookie.value) {
    locale.value = cookie.value
  }

  async function setLocale(l: 'en' | 'sv') {
    // (om du i framtiden vill lazy-loada fler språk:)
    if (!['en','sv'].includes(l)) {
      const msgs = await import(`~/i18n/locales/${l}.json`).then(m => m.default)
      setLocaleMessage(l, msgs)
    }
    locale.value = l
    cookie.value = l
    useHead({ htmlAttrs: { lang: l } })
  }

  return { locale, setLocale }
}
