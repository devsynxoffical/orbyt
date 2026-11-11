export type ToolCatalogEntry = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  popular?: boolean;
};

export type ToolCategory =
  | "Keyword Research"
  | "Backlink Analysis"
  | "Technical SEO"
  | "Rank Tracking"
  | "Content & Writing"
  | "Competitor Research"
  | "Local SEO"
  | "Social & Ads"
  | "All-in-One";

export const TOOL_CATEGORIES: ToolCategory[] = [
  "All-in-One",
  "Keyword Research",
  "Backlink Analysis",
  "Technical SEO",
  "Rank Tracking",
  "Content & Writing",
  "Competitor Research",
  "Local SEO",
  "Social & Ads",
];

/** Predefined SEO tools admins can integrate into the catalog with one click */
export const TOOL_CATALOG: ToolCatalogEntry[] = [
  { slug: "canva", name: "Canva", description: "Graphic design platform for social media graphics, presentations, and visual content.", category: "Content & Writing", popular: true },
  { slug: "chat-gpt", name: "ChatGPT", description: "OpenAI intelligent assistant for text generation, research, and coding.", category: "Content & Writing", popular: true },
  { slug: "claude", name: "Claude", description: "Anthropic conversational AI assistant with advanced reasoning and writing.", category: "Content & Writing", popular: true },
  { slug: "grammarly", name: "Grammarly", description: "AI writing assistant, grammar checker, and tone optimizer.", category: "Content & Writing", popular: true },
  { slug: "semrush", name: "Semrush", description: "All-in-one marketing toolkit for SEO, PPC, and content.", category: "All-in-One", popular: true },
  { slug: "ahrefs", name: "Ahrefs", description: "SEO toolset for backlink research, keyword exploration, and site audits.", category: "Backlink Analysis", popular: true },
  { slug: "moz", name: "Moz Pro", description: "Domain authority, keyword explorer, and link tracking.", category: "Backlink Analysis", popular: true },
  { slug: "majestic", name: "Majestic", description: "Link intelligence, trust flow, and citation flow.", category: "Backlink Analysis", popular: true },
  { slug: "quillbot", name: "QuillBot", description: "Paraphrasing and writing refinement assistant.", category: "Content & Writing", popular: true },
  { slug: "spyfu", name: "SpyFu", description: "Competitor keyword and PPC ad research.", category: "Competitor Research", popular: true },
  { slug: "keywords-everywhere", name: "Keywords Everywhere", description: "Browser-based keyword volume and CPC metrics.", category: "Keyword Research", popular: true },
  { slug: "kwfinder", name: "KWFinder", description: "Long-tail keyword research with difficulty scores.", category: "Keyword Research", popular: true },
  { slug: "lynda-com", name: "Lynda.com", description: "Online learning library for SEO and digital skills.", category: "Content & Writing" },
  { slug: "picmonkey", name: "PicMonkey", description: "Design editor for social graphics and creatives.", category: "Content & Writing" },
  { slug: "placeit", name: "Placeit", description: "Mockups and brand assets for marketing.", category: "Content & Writing" },
  { slug: "quetext", name: "Quetext", description: "Plagiarism and duplicate content checker.", category: "Content & Writing" },
  { slug: "rytr", name: "Rytr", description: "AI content writing and copy ideation.", category: "Content & Writing" },
  { slug: "scribd", name: "Scribd", description: "Document library for research and references.", category: "Content & Writing" },
  { slug: "slideshare", name: "SlideShare", description: "Presentation discovery platform for research.", category: "Content & Writing" },
  { slug: "spamzilla", name: "SpamZilla", description: "Expired domain quality and spam checking.", category: "Technical SEO" },
  { slug: "spin-rewriter", name: "Spin Rewriter", description: "Article rewriting and content spinning.", category: "Content & Writing" },
  { slug: "tuts-plus", name: "Tuts+", description: "Creative and development tutorial platform.", category: "Content & Writing" },
  { slug: "woorank", name: "WooRank", description: "Website review and SEO checklist.", category: "Technical SEO" },
  { slug: "wordai", name: "WordAI", description: "AI text rewriting and readability improvement.", category: "Content & Writing" },
  { slug: "wordhero", name: "WordHero", description: "AI writing assistant for blogs and ads.", category: "Content & Writing" },
  { slug: "wordtracker", name: "Wordtracker", description: "Keyword research and SERP comparison.", category: "Keyword Research" },
  { slug: "wordtune", name: "Wordtune", description: "Rewrite and tone adjustment for content.", category: "Content & Writing" },
  { slug: "writehuman", name: "WriteHuman", description: "Humanize AI-generated writing output.", category: "Content & Writing" },
  { slug: "writerzen", name: "WriterZen", description: "Keyword research and content planning.", category: "Content & Writing" },
];

export function getCatalogEntry(slug: string) {
  return TOOL_CATALOG.find((t) => t.slug === slug);
}

export function slugifyToolName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
