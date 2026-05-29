export interface SettingDefault {
  key: string;
  value: string;
  label: string;
  group: string;
}

export const DEFAULT_SETTINGS: SettingDefault[] = [
  { key: 'store_name', value: 'GoSawa9', label: 'Nom de la boutique', group: 'general' },
  {
    key: 'store_tagline_fr',
    value: 'Votre marketplace tunisien — produits authentiques, paiement à la livraison.',
    label: 'Slogan (FR)',
    group: 'general',
  },
  {
    key: 'store_tagline_ar',
    value: 'سوقك التونسي — منتجات أصلية والدفع عند الاستلام.',
    label: 'Slogan (AR)',
    group: 'general',
  },
  { key: 'store_email', value: 'contact@gosawa9.com', label: 'Email', group: 'contact' },
  { key: 'store_phone', value: '+216 00 000 000', label: 'Téléphone', group: 'contact' },
  { key: 'store_address', value: 'Tunis, Tunisie', label: 'Adresse', group: 'contact' },
  {
    key: 'social_facebook',
    value: 'https://facebook.com/jdidstore',
    label: 'Facebook (URL)',
    group: 'social',
  },
  {
    key: 'social_instagram',
    value: 'https://instagram.com/jdidstore',
    label: 'Instagram (URL)',
    group: 'social',
  },
  { key: 'social_tiktok', value: '', label: 'TikTok (URL)', group: 'social' },
  { key: 'social_youtube', value: '', label: 'YouTube (URL)', group: 'social' },
  { key: 'social_whatsapp', value: '', label: 'WhatsApp (URL ou laisser vide = téléphone)', group: 'social' },
  { key: 'currency', value: 'TND', label: 'Devise', group: 'general' },
  { key: 'cod_enabled', value: 'true', label: 'Paiement à la livraison', group: 'checkout' },
  { key: 'free_shipping_min', value: '200', label: 'Livraison gratuite à partir de (TND)', group: 'checkout' },
  { key: 'low_stock_threshold', value: '5', label: 'Seuil stock faible', group: 'catalog' },
  { key: 'products_per_page', value: '12', label: 'Produits par page (front)', group: 'catalog' },
  { key: 'default_sort', value: 'newest', label: 'Tri par défaut', group: 'catalog' },
  { key: 'show_out_of_stock', value: 'false', label: 'Afficher ruptures de stock', group: 'catalog' },
  { key: 'flash_sale_enabled', value: 'true', label: 'Ventes flash activées', group: 'marketing' },
  { key: 'newsletter_enabled', value: 'true', label: 'Newsletter activée', group: 'marketing' },
];

export const DEFAULT_SETTINGS_MAP = Object.fromEntries(
  DEFAULT_SETTINGS.map((s) => [s.key, s]),
);
