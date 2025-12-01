import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Language = 'pt' | 'en'

interface LanguageStore {
    language: Language
    setLanguage: (language: Language) => void
}

const getBrowserLanguage = (): Language => {
    if (typeof window === 'undefined') return 'pt'
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('pt')) return 'pt'
    return 'en'
}

export const useLanguageStore = create<LanguageStore>()(
    persist(
        (set) => ({
            language: getBrowserLanguage(),
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'language-storage',
        }
    )
)
