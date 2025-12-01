import { loadStripe } from '@stripe/stripe-js';

// Make sure to add VITE_STRIPE_PUBLISHABLE_KEY to your .env file
// @ts-ignore
const key = window.env?.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = key ? loadStripe(key) : null;

export const getStripe = () => {
    if (!stripePromise) {
        console.warn('Stripe key missing')
        return null
    }
    return stripePromise;
};

// Helper to format currency
export const formatPrice = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency,
    }).format(amount / 100);
};

export const SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'Free',
        price: 0,
        features: [
            'Análise básica de alvos',
            'Histórico dos últimos 3 tiros',
            'Diagnóstico simples',
        ],
    },
    PRO: {
        name: 'Pro',
        price: 2990, // R$ 29,90
        priceId: 'price_1SZCVe8Iz8JVKID9Lu4B4bhx', // Replace with actual Stripe Price ID
        features: [
            'Análise avançada com IA',
            'Histórico ilimitado',
            'Diagnóstico detalhado',
            'Correções personalizadas',
            'Análise de equipamento',
        ],
    },
};
