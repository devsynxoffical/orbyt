import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function upsertPlan(
  name: string,
  data: {
    description: string;
    pricePkr: number;
    durationDays: number;
    active: boolean;
  }
) {
  const existing = await prisma.plan.findFirst({ where: { name } });
  if (existing) {
    return prisma.plan.update({
      where: { id: existing.id },
      data,
    });
  }
  return prisma.plan.create({ data: { name, ...data } });
}

async function main() {
  const passwordHash = await bcrypt.hash("Admin@1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@platform.com" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@platform.com",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      whatsappNumber: null,
      defaultAccessDays: 30,
      paymentInstructions:
        "Transfer the exact amount to the selected bank account, then upload your payment screenshot. An admin will verify and grant access within 24 hours.",
    },
  });

  const bankCount = await prisma.bankAccount.count();
  if (bankCount === 0) {
    await prisma.bankAccount.create({
      data: {
        bankName: "JazzCash",
        accountTitle: "Platform Admin",
        accountNumber: "03001234567",
        active: true,
        sortOrder: 0,
      },
    });
  }

  const tools = await Promise.all([
    prisma.tool.upsert({
      where: { slug: "ahrefs" },
      update: { launchUrl: "https://ahrefs.com" },
      create: {
        name: "Ahrefs",
        slug: "ahrefs",
        description: "SEO toolset for backlink analysis, site audit, and keyword explorer.",
        pricePkr: 3500,
        accessDurationDays: 30,
        launchUrl: "https://ahrefs.com",
        active: true,
      },
    }),
    prisma.tool.upsert({
      where: { slug: "semrush" },
      update: { launchUrl: "https://www.semrush.com" },
      create: {
        name: "Semrush",
        slug: "semrush",
        description: "All-in-one marketing toolkit for SEO and PPC.",
        pricePkr: 2500,
        accessDurationDays: 30,
        launchUrl: "https://www.semrush.com",
        active: true,
      },
    }),
    prisma.tool.upsert({
      where: { slug: "moz" },
      update: { launchUrl: "https://moz.com" },
      create: {
        name: "Moz Pro",
        slug: "moz",
        description: "Domain authority tracking and keyword explorer.",
        pricePkr: 1400,
        accessDurationDays: 30,
        launchUrl: "https://moz.com",
        active: true,
      },
    }),
    prisma.tool.upsert({
      where: { slug: "spyfu" },
      update: { launchUrl: "https://www.spyfu.com" },
      create: {
        name: "SpyFu",
        slug: "spyfu",
        description: "Competitor keyword and ad research.",
        pricePkr: 1300,
        accessDurationDays: 30,
        launchUrl: "https://www.spyfu.com",
        active: true,
      },
    }),
    prisma.tool.upsert({
      where: { slug: "majestic" },
      update: { launchUrl: "https://majestic.com" },
      create: {
        name: "Majestic",
        slug: "majestic",
        description: "Link intelligence and trust flow metrics.",
        pricePkr: 1500,
        accessDurationDays: 30,
        launchUrl: "https://majestic.com",
        active: true,
      },
    }),
  ]);

  const starter = await upsertPlan("Starter", {
    description: "Essential tools for freelancers and solo marketers.",
    pricePkr: 4500,
    durationDays: 30,
    active: true,
  });

  const pro = await upsertPlan("Pro", {
    description: "Full toolkit for agencies and power users.",
    pricePkr: 12000,
    durationDays: 30,
    active: true,
  });

  const agency = await upsertPlan("Agency", {
    description: "Everything included plus priority support.",
    pricePkr: 18000,
    durationDays: 30,
    active: true,
  });

  const starterToolIds = [tools[1], tools[2]].map((t) => t.id);
  const proToolIds = tools.map((t) => t.id);
  const agencyToolIds = tools.map((t) => t.id);

  for (const toolId of starterToolIds) {
    await prisma.planTool.upsert({
      where: { planId_toolId: { planId: starter.id, toolId } },
      update: {},
      create: { planId: starter.id, toolId },
    });
  }

  for (const toolId of proToolIds) {
    await prisma.planTool.upsert({
      where: { planId_toolId: { planId: pro.id, toolId } },
      update: {},
      create: { planId: pro.id, toolId },
    });
  }

  for (const toolId of agencyToolIds) {
    await prisma.planTool.upsert({
      where: { planId_toolId: { planId: agency.id, toolId } },
      update: {},
      create: { planId: agency.id, toolId },
    });
  }

  console.log("Seed completed:", {
    tools: tools.length,
    plans: [starter.name, pro.name, agency.name],
    admin: "admin@platform.com",
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
