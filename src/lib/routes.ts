/**
 * Fonte unica de verdade para os caminhos publicos localizados.
 * Espelha `pathnames` em src/i18n/routing.ts.
 * Se a URL publica mudar, ajuste apenas aqui.
 */

export const SITE_URL = 'https://www.pinkpigstore.com'

const PRODUCTS_SEGMENT: Record<string, string> = {
    pt: 'produtos',
    en: 'products',
}

function segment(locale: string) {
    return PRODUCTS_SEGMENT[locale] ?? PRODUCTS_SEGMENT.en
}

/** Ex.: /pt/produtos */
export function productsPath(locale: string) {
    return `/${locale}/${segment(locale)}`
}

/** Ex.: /pt/produtos/meu-slug */
export function productPath(locale: string, slug: string) {
    return `/${locale}/${segment(locale)}/${slug}`
}

/** URL absoluta, para canonical / Open Graph / JSON-LD. */
export function productUrl(locale: string, slug: string) {
    return `${SITE_URL}${productPath(locale, slug)}`
}
