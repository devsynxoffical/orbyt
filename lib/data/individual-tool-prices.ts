import { getToolLogoUrl } from "@/lib/tools/logos";

export type IndividualToolPrice = {
  name: string;
  slug: string;
  pricePkr: number;
  logoUrl: string | null;
};

const RAW_TOOLS: Array<{ name: string; pricePkr: number; slug: string }> = [
  { name: "Ahrefs", pricePkr: 2500, slug: "ahrefs" },
  { name: "Keywords Everywhere", pricePkr: 800, slug: "keywords-everywhere" },
  { name: "KWFinder", pricePkr: 1200, slug: "kwfinder" },
  { name: "Lynda.com", pricePkr: 900, slug: "lynda-com" },
  { name: "Majestic", pricePkr: 1500, slug: "majestic" },
  { name: "Moz Pro", pricePkr: 1400, slug: "moz" },
  { name: "PicMonkey", pricePkr: 700, slug: "picmonkey" },
  { name: "Placeit", pricePkr: 900, slug: "placeit" },
  { name: "Quetext", pricePkr: 1100, slug: "quetext" },
  { name: "QuillBot", pricePkr: 600, slug: "quillbot" },
  { name: "Rytr", pricePkr: 700, slug: "rytr" },
  { name: "Scribd", pricePkr: 500, slug: "scribd" },
  { name: "Semrush", pricePkr: 2500, slug: "semrush" },
  { name: "SlideShare", pricePkr: 500, slug: "slideshare" },
  { name: "SpamZilla", pricePkr: 2000, slug: "spamzilla" },
  { name: "Spin Rewriter", pricePkr: 900, slug: "spin-rewriter" },
  { name: "SpyFu", pricePkr: 1300, slug: "spyfu" },
  { name: "Tuts+", pricePkr: 600, slug: "tuts-plus" },
  { name: "WooRank", pricePkr: 1200, slug: "woorank" },
  { name: "WordAI", pricePkr: 1000, slug: "wordai" },
  { name: "WordHero", pricePkr: 900, slug: "wordhero" },
  { name: "Wordtracker", pricePkr: 900, slug: "wordtracker" },
  { name: "Wordtune", pricePkr: 700, slug: "wordtune" },
  { name: "WriteHuman", pricePkr: 1000, slug: "writehuman" },
  { name: "WriterZen", pricePkr: 1500, slug: "writerzen" },
];

export const INDIVIDUAL_TOOL_PRICES: IndividualToolPrice[] = RAW_TOOLS.map(
  (tool) => ({
    ...tool,
    logoUrl: getToolLogoUrl({ slug: tool.slug, name: tool.name }),
  })
);
