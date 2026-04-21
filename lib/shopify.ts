/**
 * Configuración de la tienda (Lemon Squeezy).
 * Cambia SHOP_BASE_URL si tu dominio cambia.
 */
export const SHOP_BASE_URL = "https://carruseldeoportunidades.lemonsqueezy.com";

/**
 * Construye la URL de checkout a partir de un UUID o URL completa.
 * Ej: productUrl("de95aacd-9c78-43ac-9cfb-64a8e62e76d4")
 *  => https://carruseldeoportunidades.lemonsqueezy.com/checkout/buy/de95aacd-9c78-43ac-9cfb-64a8e62e76d4
 */
export function productUrl(handleOrUrl: string): string {
  if (!handleOrUrl) return SHOP_BASE_URL;
  if (handleOrUrl.startsWith("http")) return handleOrUrl;
  return `${SHOP_BASE_URL}/checkout/buy/${handleOrUrl.replace(/^\//, "")}`;
}
