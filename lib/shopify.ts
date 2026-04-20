/**
 * Configuración de la tienda Shopify.
 * Cambia SHOP_BASE_URL si tu dominio cambia.
 */
export const SHOP_BASE_URL = "https://carruseldeoportunidades.es";

/**
 * Construye la URL de un producto a partir de su handle.
 * Ej: productUrl("el-ultimo-faro-ebook")
 *  => https://carruseldeoportunidades.es/products/el-ultimo-faro-ebook
 */
export function productUrl(handle: string) {
  if (!handle) return SHOP_BASE_URL;
  if (handle.startsWith("http")) return handle;
  return `${SHOP_BASE_URL}/products/${handle.replace(/^\//, "")}`;
}
