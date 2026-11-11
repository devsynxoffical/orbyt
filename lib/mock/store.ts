import {
  AccessSource,
  AccessStatus,
  PaymentOrderStatus,
  Role,
  SubStatus,
  UserStatus,
} from "@prisma/client";
import { isDemoAccountEmail } from "@/lib/demo-accounts";
import { INDIVIDUAL_TOOL_PRICES } from "@/lib/data/individual-tool-prices";
import { encryptCookiesFromJson } from "@/lib/crypto/cookies";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
};

export type MockTool = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  description: string | null;
  pricePkr: number;
  accessDurationDays: number;
  launchUrl: string | null;
  proxySubdomain?: string | null;
  launchMode?: "PROXY" | "EXTENSION" | "CLOUD" | "DIRECT";
  active: boolean;
};

export type MockPlatformSettings = {
  whatsappNumber: string | null;
  defaultAccessDays: number;
  paymentInstructions: string | null;
};

export type MockBankAccount = {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
};

export type MockPaymentOrder = {
  id: string;
  userId: string;
  toolId: string;
  amountPkr: number;
  paymentMethod?: "MANUAL" | "STRIPE";
  bankAccountId: string | null;
  screenshotUrl: string | null;
  status: PaymentOrderStatus;
  userNote: string | null;
  adminNote: string | null;
  reviewedAt: Date | null;
  reviewedById: string | null;
  createdAt: Date;
};

export type MockToolAccount = {
  id: string;
  toolId: string;
  label: string;
  cookieDataEnc: string;
  maxConcurrentUsers: number;
  active: boolean;
  healthStatus: "UNKNOWN" | "ALIVE" | "EXPIRED";
  lastHealthCheckAt: Date | null;
  lastHealthError: string | null;
  lastVerifiedAt: Date | null;
  notes: string | null;
  createdAt: Date;
};

export type MockSupportMessage = {
  id: string;
  threadId: string;
  senderRole: "USER" | "ADMIN";
  senderId: string;
  body: string;
  createdAt: Date;
};

export type MockSupportThread = {
  id: string;
  userId: string;
  subject: string;
  status: "OPEN" | "CLOSED";
  lastMessageAt: Date;
  adminUnreadCount: number;
  userUnreadCount: number;
  createdAt: Date;
};

export type MockPlan = {
  id: string;
  name: string;
  description: string | null;
  pricePkr: number;
  durationDays: number;
  active: boolean;
  toolIds: string[];
};

export type MockSubscription = {
  id: string;
  userId: string;
  planId: string | null;
  status: SubStatus;
  startedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  notes: string | null;
};

export type MockUserToolAccess = {
  id: string;
  userId: string;
  toolId: string;
  status: AccessStatus;
  grantedAt: Date;
  expiresAt: Date | null;
  source: AccessSource;
};

export type MockToolRequest = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  toolIds: string[];
  note: string | null;
  status: "PENDING" | "FULFILLED" | "DISMISSED";
  createdAt: Date;
};

export type MockPasswordResetToken = {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

export type MockLaunchToken = {
  id: string;
  tokenHash: string;
  userId: string;
  toolId: string;
  toolAccountId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function makeTool(
  id: string,
  name: string,
  slug: string,
  iconUrl: string,
  description: string,
  pricePkr: number
): MockTool {
  return {
    id,
    name,
    slug,
    iconUrl,
    description,
    pricePkr,
    accessDurationDays: 30,
    launchUrl: null,
    active: true,
  };
}

function createInitialStore() {
  const priceBySlug = Object.fromEntries(
    INDIVIDUAL_TOOL_PRICES.map((t) => [t.slug, t.pricePkr])
  );

  const tools: MockTool[] = [
    {
      ...makeTool(
        "tool-0",
        "Ahrefs",
        "ahrefs",
        "/tool-logos/ahrefs.png",
        "SEO toolset for backlink research, keyword exploration, and site audits.",
        priceBySlug["ahrefs"] ?? 2500
      ),
      launchUrl: "https://app.ahrefs.com/dashboard",
      launchMode: "PROXY",
    },
    makeTool("tool-1", "Keywords Everywhere", "keywords-everywhere", "/tool-logos/keywords-everywhere.png", "Search volume and keyword metrics inside browser.", priceBySlug["keywords-everywhere"] ?? 0),
    makeTool("tool-2", "KWFinder", "kwfinder", "/tool-logos/kwfinder.png", "Long-tail keyword research with difficulty scoring.", priceBySlug["kwfinder"] ?? 0),
    makeTool("tool-3", "Lynda.com", "lynda-com", "/tool-logos/lynda-com.png", "Learning library for marketing and SEO skills.", priceBySlug["lynda-com"] ?? 0),
    makeTool("tool-4", "Majestic", "majestic", "/tool-logos/majestic.png", "Link intelligence metrics.", priceBySlug["majestic"] ?? 0),
    {
      ...makeTool("tool-5", "Moz Pro", "moz", "/tool-logos/moz.png", "Domain authority tracking.", priceBySlug["moz"] ?? 1400),
      launchUrl: "https://moz.com/pro",
      launchMode: "PROXY",
    },
    makeTool("tool-6", "PicMonkey", "picmonkey", "/tool-logos/picmonkey.png", "Visual content editor for banners and creatives.", priceBySlug["picmonkey"] ?? 0),
    makeTool("tool-7", "Placeit", "placeit", "/tool-logos/placeit.png", "Mockups and social design assets.", priceBySlug["placeit"] ?? 0),
    makeTool("tool-8", "Quetext", "quetext", "/tool-logos/quetext.png", "Plagiarism and duplicate content detection.", priceBySlug["quetext"] ?? 0),
    makeTool("tool-9", "QuillBot", "quillbot", "/tool-logos/quillbot.png", "Paraphrasing and writing refinement assistant.", priceBySlug["quillbot"] ?? 0),
    makeTool("tool-10", "Rytr", "rytr", "/tool-logos/rytr.png", "AI writing assistant for content drafting.", priceBySlug["rytr"] ?? 0),
    makeTool("tool-11", "Scribd", "scribd", "/tool-logos/scribd.png", "Document and publication research library.", priceBySlug["scribd"] ?? 0),
    {
      ...makeTool("tool-12", "Semrush", "semrush", "/tool-logos/semrush.png", "All-in-one marketing toolkit.", priceBySlug["semrush"] ?? 2500),
      launchUrl: "https://www.semrush.com/projects/",
      launchMode: "PROXY",
    },
    makeTool("tool-13", "SlideShare", "slideshare", "/tool-logos/slideshare.png", "Presentation discovery for research and outreach.", priceBySlug["slideshare"] ?? 0),
    makeTool("tool-14", "SpamZilla", "spamzilla", "/tool-logos/spamzilla.png", "Expired domain spam analysis and filtering.", priceBySlug["spamzilla"] ?? 0),
    makeTool("tool-15", "Spin Rewriter", "spin-rewriter", "/tool-logos/spin-rewriter.png", "Article rewriting and spinning workflows.", priceBySlug["spin-rewriter"] ?? 0),
    makeTool("tool-16", "SpyFu", "spyfu", "/tool-logos/spyfu.png", "Competitor keyword research.", priceBySlug["spyfu"] ?? 0),
    makeTool("tool-17", "Tuts+", "tuts-plus", "/tool-logos/tuts-plus.png", "Tutorial library for digital professionals.", priceBySlug["tuts-plus"] ?? 0),
    makeTool("tool-18", "WooRank", "woorank", "/tool-logos/woorank.png", "Website audit and optimization reports.", priceBySlug["woorank"] ?? 0),
    makeTool("tool-19", "WordAI", "wordai", "/tool-logos/wordai.png", "AI content rewriting and readability improvement.", priceBySlug["wordai"] ?? 0),
    makeTool("tool-20", "WordHero", "wordhero", "/tool-logos/wordhero.png", "AI content generation for blogs and ads.", priceBySlug["wordhero"] ?? 0),
    makeTool("tool-21", "Wordtracker", "wordtracker", "/tool-logos/wordtracker.png", "Keyword discovery and SERP analysis.", priceBySlug["wordtracker"] ?? 0),
    makeTool("tool-22", "Wordtune", "wordtune", "/tool-logos/wordtune.png", "Sentence rewriting and tone optimization.", priceBySlug["wordtune"] ?? 0),
    makeTool("tool-23", "WriteHuman", "writehuman", "/tool-logos/writehuman.png", "AI text humanization and style enhancement.", priceBySlug["writehuman"] ?? 0),
    makeTool("tool-24", "WriterZen", "writerzen", "/tool-logos/writerzen.png", "Keyword clustering and content briefing platform.", priceBySlug["writerzen"] ?? 0),
    {
      ...makeTool("tool-25", "CANVA", "canva", "/tool-logos/canva.svg", "Graphic design and creative suite.", 5000),
      launchUrl: "https://www.canva.com/",
      launchMode: "EXTENSION",
    },
    {
      ...makeTool("tool-26", "Chat GPT", "chat-gpt", "/tool-logos/chatgpt.svg", "AI assistant for research, content, and coding.", 0),
      launchUrl: "https://chatgpt.com/",
      launchMode: "EXTENSION",
    },
    {
      ...makeTool("tool-27", "Claude", "claude", "/tool-logos/claude.svg", "Anthropic AI assistant for writing and analysis.", 480),
      launchUrl: "https://claude.ai/new",
      launchMode: "EXTENSION",
    },
    {
      ...makeTool("tool-28", "Grammarly", "grammarly", "/tool-logos/grammarly.svg", "Grammarly Testing", 100),
      launchUrl: "https://app.grammarly.com/",
      launchMode: "EXTENSION",
    },
  ];

  const idBySlug = Object.fromEntries(tools.map((t) => [t.slug, t.id]));
  const toolIdsFromSlugs = (slugs: string[]) =>
    slugs.map((slug) => idBySlug[slug]).filter(Boolean);

  const plans: MockPlan[] = [
    {
      id: "plan-1",
      name: "Starter",
      description: "Essential tools for freelancers.",
      pricePkr: 4500,
      durationDays: 30,
      active: true,
      toolIds: toolIdsFromSlugs([
        "keywords-everywhere",
        "kwfinder",
        "moz",
        "quillbot",
        "rytr",
        "scribd",
        "slideshare",
        "tuts-plus",
        "wordtune",
        "writehuman",
      ]),
    },
    {
      id: "plan-2",
      name: "Pro",
      description: "Full toolkit for agencies.",
      pricePkr: 12000,
      durationDays: 30,
      active: true,
      toolIds: tools.map((t) => t.id),
    },
    {
      id: "plan-3",
      name: "Agency",
      description: "Everything plus priority support.",
      pricePkr: 18000,
      durationDays: 30,
      active: true,
      toolIds: tools.map((t) => t.id),
    },
  ];

  const users: MockUser[] = [
    { id: "user-demo", name: "Demo User", email: "user@demo.com", password: "demo1234", role: "USER", status: "ACTIVE", createdAt: daysFromNow(-30) },
    { id: "user-admin", name: "Demo Admin", email: "admin@demo.com", password: "demo1234", role: "ADMIN", status: "ACTIVE", createdAt: daysFromNow(-60) },
    { id: "user-2", name: "Sarah Khan", email: "sarah@agency.com", password: "demo1234", role: "USER", status: "ACTIVE", createdAt: daysFromNow(-14) },
    { id: "user-3", name: "James Wilson", email: "james@seo.io", password: "demo1234", role: "USER", status: "SUSPENDED", createdAt: daysFromNow(-45) },
  ];

  const subscriptions: MockSubscription[] = [
    { id: "sub-1", userId: "user-demo", planId: "plan-2", status: "ACTIVE", startedAt: daysFromNow(-12), expiresAt: daysFromNow(18), createdAt: daysFromNow(-12), notes: null },
    { id: "sub-2", userId: "user-2", planId: "plan-1", status: "ACTIVE", startedAt: daysFromNow(-25), expiresAt: daysFromNow(5), createdAt: daysFromNow(-25), notes: null },
    { id: "sub-3", userId: "user-3", planId: null, status: "PENDING", startedAt: null, expiresAt: null, createdAt: daysFromNow(-3), notes: "Awaiting offline payment" },
  ];

  const toolAccess: MockUserToolAccess[] = [
    { id: "access-ahrefs", userId: "user-demo", toolId: idBySlug["ahrefs"], status: "ACTIVE", grantedAt: daysFromNow(-12), expiresAt: daysFromNow(18), source: "PLAN" },
    { id: "access-1", userId: "user-demo", toolId: idBySlug["semrush"], status: "ACTIVE", grantedAt: daysFromNow(-12), expiresAt: daysFromNow(18), source: "PLAN" },
    { id: "access-2", userId: "user-demo", toolId: idBySlug["moz"], status: "ACTIVE", grantedAt: daysFromNow(-12), expiresAt: daysFromNow(18), source: "PLAN" },
    { id: "access-3", userId: "user-demo", toolId: idBySlug["spyfu"], status: "ACTIVE", grantedAt: daysFromNow(-12), expiresAt: daysFromNow(18), source: "PLAN" },
    { id: "access-6", userId: "user-demo", toolId: idBySlug["canva"], status: "ACTIVE", grantedAt: daysFromNow(-12), expiresAt: daysFromNow(18), source: "PLAN" },
    { id: "access-7", userId: "user-demo", toolId: idBySlug["chat-gpt"], status: "ACTIVE", grantedAt: daysFromNow(-12), expiresAt: daysFromNow(18), source: "PLAN" },
    { id: "access-8", userId: "user-demo", toolId: idBySlug["claude"], status: "ACTIVE", grantedAt: daysFromNow(-12), expiresAt: daysFromNow(18), source: "PLAN" },
    { id: "access-9", userId: "user-demo", toolId: idBySlug["grammarly"], status: "ACTIVE", grantedAt: daysFromNow(-12), expiresAt: daysFromNow(18), source: "PLAN" },
    { id: "access-4", userId: "user-2", toolId: idBySlug["kwfinder"], status: "ACTIVE", grantedAt: daysFromNow(-25), expiresAt: daysFromNow(5), source: "PLAN" },
    { id: "access-5", userId: "user-2", toolId: idBySlug["wordtune"], status: "ACTIVE", grantedAt: daysFromNow(-25), expiresAt: daysFromNow(5), source: "PLAN" },
  ];

  const toolRequests: MockToolRequest[] = [];
  const passwordResetTokens: MockPasswordResetToken[] = [];
  const launchTokens: MockLaunchToken[] = [];

  const platformSettings: MockPlatformSettings = {
    whatsappNumber: null,
    defaultAccessDays: 30,
    paymentInstructions:
      "Transfer the exact amount to the selected bank account, then upload your payment screenshot below.",
  };

  const bankAccounts: MockBankAccount[] = [];

  const paymentOrders: MockPaymentOrder[] = [];

  const toolAccounts: MockToolAccount[] = [
    {
      id: "account-ahrefs-1",
      toolId: idBySlug["ahrefs"],
      label: "Ahrefs Agency Account #1",
      cookieDataEnc: encryptCookiesFromJson(
        JSON.stringify([
          {
            name: "ahrefs_session",
            value: "ahrefs_valid_session_orbyt_token_prod_991823",
            domain: ".ahrefs.com",
            path: "/",
            secure: true,
            httpOnly: true,
          },
        ])
      ),
      maxConcurrentUsers: 15,
      active: true,
      healthStatus: "ALIVE",
      lastHealthCheckAt: daysFromNow(-1),
      lastHealthError: null,
      lastVerifiedAt: daysFromNow(-1),
      notes: "Main agency seat with unlimited dashboard audit access",
      createdAt: daysFromNow(-30),
    },
    {
      id: "account-semrush-1",
      toolId: idBySlug["semrush"],
      label: "Semrush Business Account #1",
      cookieDataEnc: encryptCookiesFromJson(
        JSON.stringify([
          {
            name: "PHPSESSID",
            value: "semrush_valid_session_token_orbyt_882910",
            domain: ".semrush.com",
            path: "/",
            secure: true,
            httpOnly: true,
          },
        ])
      ),
      maxConcurrentUsers: 20,
      active: true,
      healthStatus: "ALIVE",
      lastHealthCheckAt: daysFromNow(-1),
      lastHealthError: null,
      lastVerifiedAt: daysFromNow(-1),
      notes: "High concurrency pool",
      createdAt: daysFromNow(-30),
    },
    {
      id: "account-moz-1",
      toolId: idBySlug["moz"],
      label: "Moz Pro Enterprise #1",
      cookieDataEnc: encryptCookiesFromJson(
        JSON.stringify([
          {
            name: "moz_session",
            value: "moz_valid_session_token_orbyt_771922",
            domain: ".moz.com",
            path: "/",
            secure: true,
            httpOnly: true,
          },
        ])
      ),
      maxConcurrentUsers: 15,
      active: true,
      healthStatus: "ALIVE",
      lastHealthCheckAt: daysFromNow(-1),
      lastHealthError: null,
      lastVerifiedAt: daysFromNow(-1),
      notes: "Moz Pro tier",
      createdAt: daysFromNow(-30),
    },
    {
      id: "account-canva-1",
      toolId: idBySlug["canva"],
      label: "Canva Pro Team #1",
      cookieDataEnc: encryptCookiesFromJson(
        JSON.stringify([
          {
            name: "auth_token",
            value: "canva_valid_auth_token_orbyt_661920",
            domain: ".canva.com",
            path: "/",
            secure: true,
            httpOnly: true,
          },
        ])
      ),
      maxConcurrentUsers: 25,
      active: true,
      healthStatus: "ALIVE",
      lastHealthCheckAt: daysFromNow(-1),
      lastHealthError: null,
      lastVerifiedAt: daysFromNow(-1),
      notes: "Canva Pro team subscription",
      createdAt: daysFromNow(-30),
    },
  ];

  // Seed default working accounts for remaining tools so proxy and extension launches work smoothly
  for (const t of tools) {
    if (!toolAccounts.some((a) => a.toolId === t.id)) {
      toolAccounts.push({
        id: `account-${t.slug}-1`,
        toolId: t.id,
        label: `${t.name} Account #1`,
        cookieDataEnc: encryptCookiesFromJson(
          JSON.stringify([
            {
              name: `${t.slug.replace(/-/g, "_")}_session`,
              value: `session_token_${t.slug}_active_1`,
              domain: t.slug.includes(".") ? t.slug : `.${t.slug}.com`,
              path: "/",
              secure: true,
              httpOnly: true,
            },
          ])
        ),
        maxConcurrentUsers: 10,
        active: true,
        healthStatus: "ALIVE",
        lastHealthCheckAt: daysFromNow(-1),
        lastHealthError: null,
        lastVerifiedAt: daysFromNow(-1),
        notes: "Automated session pool",
        createdAt: daysFromNow(-30),
      });
    }
  }

  const supportThreads: MockSupportThread[] = [
    {
      id: "thread-demo",
      userId: "user-demo",
      subject: "Welcome to Orbyt Rush Support",
      status: "OPEN",
      lastMessageAt: daysFromNow(-1),
      adminUnreadCount: 0,
      userUnreadCount: 0,
      createdAt: daysFromNow(-2),
    },
  ];

  const supportMessages: MockSupportMessage[] = [
    {
      id: "msg-1",
      threadId: "thread-demo",
      senderRole: "ADMIN",
      senderId: "user-admin",
      body: "Welcome to Orbyt Rush! Let us know if you need assistance configuring your SEO tools or browser launcher.",
      createdAt: daysFromNow(-1),
    },
  ];

  return {
    tools,
    plans,
    users,
    subscriptions,
    toolAccess,
    toolRequests,
    passwordResetTokens,
    launchTokens,
    platformSettings,
    bankAccounts,
    paymentOrders,
    toolAccounts,
    supportThreads,
    supportMessages,
  };
}

type Store = ReturnType<typeof createInitialStore>;

const globalStore = globalThis as unknown as { __mockStore?: Store };

function ensureDemoAccountsActive(store: Store) {
  for (const user of store.users) {
    if (isDemoAccountEmail(user.email)) {
      user.status = "ACTIVE";
    }
  }
}

function getStore(): Store {
  if (!globalStore.__mockStore) {
    globalStore.__mockStore = createInitialStore();
  }
  const store = globalStore.__mockStore;
  if (!store.toolRequests) {
    store.toolRequests = [];
  }
  if (!store.passwordResetTokens) {
    store.passwordResetTokens = [];
  }
  if (!store.launchTokens) {
    store.launchTokens = [];
  }
  if (!store.supportThreads) {
    store.supportThreads = [];
  }
  if (!store.supportMessages) {
    store.supportMessages = [];
  }
  for (const account of store.toolAccounts) {
    if (!account.healthStatus) account.healthStatus = "UNKNOWN";
    if (account.lastHealthCheckAt === undefined) account.lastHealthCheckAt = null;
    if (account.lastHealthError === undefined) account.lastHealthError = null;
  }
  ensureDemoAccountsActive(store);
  return store;
}

export const mockStore = {
  get users() { return getStore().users; },
  get tools() { return getStore().tools; },
  get plans() { return getStore().plans; },
  get subscriptions() { return getStore().subscriptions; },
  get toolAccess() { return getStore().toolAccess; },
  get toolRequests() { return getStore().toolRequests; },
  get passwordResetTokens() { return getStore().passwordResetTokens; },
  set passwordResetTokens(value: MockPasswordResetToken[]) {
    getStore().passwordResetTokens = value;
  },
  get platformSettings() { return getStore().platformSettings; },
  set platformSettings(value: MockPlatformSettings) {
    getStore().platformSettings = value;
  },
  get bankAccounts() { return getStore().bankAccounts; },
  get paymentOrders() { return getStore().paymentOrders; },
  get toolAccounts() { return getStore().toolAccounts; },
  get launchTokens() { return getStore().launchTokens; },
  get supportThreads() { return getStore().supportThreads; },
  get supportMessages() { return getStore().supportMessages; },
};

export function mockId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
