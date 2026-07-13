export type ProductVariant = {
  label: string;
  stripePrice: string; // Stripe Price ID from dashboard: price_xxx
  inStock?: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // display price in USD
  images: string[]; // paths relative to site root — put files in static/images/shop/<id>/
  variants?: ProductVariant[]; // e.g. sizes — each variant has its own Stripe Price
  stripePrice?: string; // use this only if there are no variants
  tags?: string[];
};

// ─── Add your products here ───────────────────────────────────────────────────
// 1. Create a Stripe product + price for each variant (or one price if no variants)
// 2. Copy the price ID (price_xxx) from the Stripe dashboard into stripePrice
// 3. Drop product images into static/images/shop/<product-id>/
// ─────────────────────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  {
    id: "pvr-tee",
    name: "PVR Logo Tee",
    description:
      "Black heavyweight tee with the PVR head logo screen printed on the chest. 100% cotton, unisex fit.",
    price: 40,
    images: [
      "/images/shop/pvr-tee/front.jpg",
      "/images/shop/pvr-tee/back.jpg",
      "/images/shop/pvr-tee/detail.jpg",
    ],
    tags: ["apparel"],
    variants: [
      { label: "S", stripePrice: "price_1TsZnXEVXCXbQ9FJL9x5svIb" },
      { label: "M", stripePrice: "price_1TsZnXEVXCXbQ9FJL9x5svIb" },
      { label: "L", stripePrice: "price_1TsZnXEVXCXbQ9FJL9x5svIb" },
      { label: "XL", stripePrice: "price_1TsZnXEVXCXbQ9FJL9x5svIb" },
    ],
  },
  {
    id: "pvr-tote",
    name: "PVR Tote Bag",
    description:
      'Heavy canvas tote with the full PVR logo. Wide enough to carry a 12" record.',
    price: 20,
    images: ["/images/shop/pvr-tote/front.jpg"],
    tags: ["accessories"],
    stripePrice: "price_1TsaCKEVXCXbQ9FJjHyfWswC",
  },
];
