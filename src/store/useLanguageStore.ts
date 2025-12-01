import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Language = 'pt' | 'en'

interface LanguageStore {
    language: Language
    setLanguage: (language: Language) => void
}

const getBrowserLanguage = (): Language => {
    if (typeof window === 'undefined') return 'pt'

    // 1. Check navigator language (primary signal)
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('pt')) return 'pt'

    // 2. Check timezone (secondary signal for "student's timezone")
    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (timeZone.includes('Sao_Paulo') || timeZone.includes('Brazil')) {
            return 'pt'
        }
    } catch (e) {
        console.warn('Failed to detect timezone', e)
    }

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
