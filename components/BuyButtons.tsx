import { productUrl, SHOP_BASE_URL } from "@/lib/shopify";
import type { BuyLink } from "@/lib/content";

type Props = {
  buyLinks?: BuyLink[];
  // Compatibilidad con el modelo antiguo
  ebookUrl?: string;
  printUrl?: string;
  priceEbook?: number;
  pricePrint?: number;
};

const FORMAT_LABELS: Record<BuyLink["format"], string> = {
  paperback: "Tapa blanda",
  hardcover: "Tapa dura",
  kindle: "Kindle",
  epub: "EPUB",
  pdf: "PDF"
};

const FORMAT_ORDER: BuyLink["format"][] = [
  "paperback",
  "hardcover",
  "kindle",
  "epub",
  "pdf"
];

const STORE_LABELS: Record<BuyLink["store"], string> = {
  "amazon-es": "Amazon ES",
  "amazon-com": "Amazon US",
  "amazon-uk": "Amazon UK",
  kobo: "Kobo",
  own: "Mi tienda",
  other: "Tienda"
};

export function BuyButtons({
  buyLinks,
  ebookUrl,
  printUrl,
  priceEbook,
  pricePrint
}: Props) {
  // Si hay buyLinks nuevos, los agrupamos por formato
  if (buyLinks && buyLinks.length > 0) {
    const groups = FORMAT_ORDER.map((fmt) => ({
      format: fmt,
      items: buyLinks.filter((l) => l.format === fmt)
    })).filter((g) => g.items.length > 0);

    return (
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.format}>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/50 mb-2">
              {FORMAT_LABELS[group.format]}
            </p>
            <div className="space-y-1.5">
              {group.items.map((link, i) => {
                const isFeatured = link.store === "own";
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener"
                    className={
                      isFeatured
                        ? "block bg-accent text-white px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition flex items-center justify-between"
                        : "block border border-ink/20 px-4 py-2.5 rounded-lg hover:border-accent hover:bg-accent/5 transition flex items-center justify-between"
                    }
                  >
                    <span className="text-sm">
                      {link.label || STORE_LABELS[link.store]}
                      {isFeatured && " ⭐"}
                    </span>
                    {link.price && (
                      <span className="text-sm font-semibold">
                        {link.price.toFixed(2)}
                        {link.currency || "€"}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback: modelo antiguo (ebookUrl / printUrl)
  const ebook = ebookUrl ? productUrl(ebookUrl) : null;
  const print = printUrl ? productUrl(printUrl) : null;
  const fallback = !ebook && !print ? SHOP_BASE_URL : null;

  return (
    <div className="space-y-2">
      {ebook && (
        <a
          href={ebook}
          target="_blank"
          rel="noopener"
          className="block bg-accent text-white text-center py-3 rounded-full font-medium hover:opacity-90 transition"
        >
          Comprar ebook{priceEbook ? ` — ${priceEbook}€` : ""}
        </a>
      )}
      {print && (
        <a
          href={print}
          target="_blank"
          rel="noopener"
          className="block border-2 border-accent text-accent text-center py-3 rounded-full font-medium hover:bg-accent hover:text-white transition"
        >
          Comprar PDF{pricePrint ? ` — ${pricePrint}€` : ""}
        </a>
      )}
      {fallback && (
        <a
          href={fallback}
          target="_blank"
          rel="noopener"
          className="block bg-accent text-white text-center py-3 rounded-full font-medium hover:opacity-90 transition"
        >
          Ver en la tienda
        </a>
      )}
    </div>
  );
}
