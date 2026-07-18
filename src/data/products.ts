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
    id: "pvr-decal",
    name: "PVR Vinyl Decal",
    description:
      "Hand-cut black matte vinyl decal. Approx 2\" wide × 3\" tall. Available as a solid or cutout logo. Cut at home in Seattle.",
    price: 5,
    images: [
      "/images/shop/pvr-decal/decal-1.png",
      "/images/shop/pvr-decal/decal-2.png",
      "/images/shop/pvr-decal/solid.png",
      "/images/shop/pvr-decal/cutout.png",
    ],
    tags: ["accessories"],
    variants: [
      { label: "Solid", stripePrice: "price_1TuhLmEV0X4rFJV7GwhKDI8s" },
      { label: "Cutout", stripePrice: "price_1TuhLmEV0X4rFJV7GwhKDI8s" },
    ],
  },
  {
    id: "pvr-coaster",
    name: "PVR Cork Coaster",
    description:
      "Hand-made cork coaster with PVR logo heat transfer. Available with a solid or hollow logo. Made by us in Seattle.",
    price: 6,
    images: [
      "/images/shop/pvr-coaster/solid-logo.png",
      "/images/shop/pvr-coaster/hollow-logo.png",
      "/images/shop/pvr-coaster/both.png",
    ],
    tags: ["accessories"],
    variants: [
      { label: "Solid Logo", stripePrice: "price_1TuhNREV0X4rFJV7RFtsQ0X8" },
      { label: "Hollow Logo", stripePrice: "price_1TuhNREV0X4rFJV7RFtsQ0X8" },
    ],
  },
  {
    id: "pvr-cyanotype",
    name: "Ballard Cyanotype Print",
    description:
      "8×10 cyanotype print on 280g/m² paper. Shot on film in Ballard and hand-printed at home — each one is unique with its own natural variations.",
    price: 20,
    images: [
      "/images/shop/pvr-cyanotype/print-1.png",
      "/images/shop/pvr-cyanotype/print-2.png",
    ],
    tags: ["art"],
    stripePrice: "price_1TuhOhEV0X4rFJV7mb5aPzIS",
  },
  {
    id: "pvr-cyanotype-2",
    name: "Ballard Brewery District Cyanotype Print",
    description:
      "8×10 cyanotype print on 280g/m² paper. Shot on film in the Ballard brewery district and hand-printed at home — each one is unique with its own natural variations.",
    price: 20,
    images: [
      "/images/shop/pvr-cyanotype-2/print-1.png",
      "/images/shop/pvr-cyanotype-2/print-2.png",
    ],
    tags: ["art"],
    stripePrice: "price_1TuhOhEV0X4rFJV7mb5aPzIS",
  },
  {
    id: "pvr-cyanotype-3",
    name: "Summer Solstice Cyanotype Print",
    description:
      "8×10 cyanotype print on 280g/m² paper. Vinyl event flyer from our Summer Solstice night at Rapha Seattle, June 20th 2025. Hand-printed at home — each one is unique with its own natural variations.",
    price: 20,
    images: [
      "/images/shop/pvr-cyanotype-3/print-1.png",
      "/images/shop/pvr-cyanotype-3/print-2.png",
    ],
    tags: ["art"],
    stripePrice: "price_1TuhOhEV0X4rFJV7mb5aPzIS",
  },
];
