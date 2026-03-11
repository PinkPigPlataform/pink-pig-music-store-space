import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

export function formatPrice(
    cents: number,
    currency = 'BRL',
    locale?: string
): string {
    const resolvedLocale = locale ?? (currency === 'USD' ? 'en-US' : 'pt-BR')
    return new Intl.NumberFormat(resolvedLocale, {
        style: 'currency',
        currency,
    }).format(cents / 100)
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str
    return str.slice(0, length) + '…'
}
