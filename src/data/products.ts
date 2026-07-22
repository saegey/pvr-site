export type ProductVariant = {
  label: string;
  priceLookupKey: string; // Same Stripe Price lookup key in live and sandbox
  inStock?: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // display price in USD
  images: string[]; // paths relative to site root — put files in static/images/shop/<id>/
  variants?: ProductVariant[]; // e.g. sizes — each variant has its own lookup key
  priceLookupKey?: string; // use this only if there are no variants
  tags?: string[];
};

// ─── Add your products here ───────────────────────────────────────────────────
// 1. Create a Stripe product + price for each variant (or one price if no variants)
//    in both live mode and your sandbox.
// 2. Give the matching prices the same lookup key (for example, pvr-decal-solid)
//    and put that key here.
// 3. Drop product images into static/images/shop/<product-id>/
// ─────────────────────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  {
    id: "pvr-cyanotype-print-pvr-logo",
    name: "PVR Cyanotype Print",
    description:
      "8×10 cyanotype print on 280g/m² paper and hand-printed at home — each one is unique with its own natural variations.",
    price: 20,
    images: [
      "/images/shop/pvr-cyanotype-print-pvr-logo/print-1.png",
      "/images/shop/pvr-cyanotype-print-pvr-logo/print-2.png",
    ],
    tags: ["art"],
    priceLookupKey: "pvr-cyanotype-print-pvr-logo",
  },
  {
    id: "pvr-5-panel-hat",
    name: "PVR 5 Panel Hat",
    description:
      "5 panel hat. Waterproof nylon baseball cap ",
    price: 35,
    images: [
      "/images/shop/pvr-5-panel-hat/hat-1.png",
      "/images/shop/pvr-5-panel-hat/hat-2.png",
    ],
    tags: ["art"],
    priceLookupKey: "pvr-5-panel-hat",
  },
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
      { label: "Solid", priceLookupKey: "pvr-decal-solid" },
      { label: "Cutout", priceLookupKey: "pvr-decal-cutout" },
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
      { label: "Solid Logo", priceLookupKey: "pvr-coaster" },
      { label: "Hollow Logo", priceLookupKey: "pvr-coaster" },
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
    priceLookupKey: "pvr-cyanotype-print",
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
    priceLookupKey: "pvr-cyanotype-print",
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
    priceLookupKey: "pvr-cyanotype-print",
  },
];
