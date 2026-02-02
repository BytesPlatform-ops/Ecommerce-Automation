const { prisma } = require("../src/lib/prisma");

async function seedThemes() {
  const themes = [
    {
      name: "Ocean",
      primaryHex: "#0066CC",
      secondaryHex: "#00D9FF",
      fontFamily: "Inter",
    },
    {
      name: "Forest",
      primaryHex: "#2D5016",
      secondaryHex: "#6BA547",
      fontFamily: "Poppins",
    },
    {
      name: "Sunset",
      primaryHex: "#FF6B35",
      secondaryHex: "#FFD23F",
      fontFamily: "Playfair Display",
    },
    {
      name: "Midnight",
      primaryHex: "#1A1A2E",
      secondaryHex: "#16213E",
      fontFamily: "Roboto",
    },
    {
      name: "Rose",
      primaryHex: "#D63384",
      secondaryHex: "#FFC0D9",
      fontFamily: "Georgia",
    },
    {
      name: "Emerald",
      primaryHex: "#10B981",
      secondaryHex: "#A7F3D0",
      fontFamily: "Poppins",
    },
  ];

  try {
    for (const theme of themes) {
      const existing = await prisma.theme.findUnique({
        where: { name: theme.name },
      });

      if (!existing) {
        await prisma.theme.create({
          data: theme,
        });
        console.log(`✓ Created theme: ${theme.name}`);
      } else {
        console.log(`• Theme already exists: ${theme.name}`);
      }
    }

    console.log("\n✓ Seeding completed!");
  } catch (error) {
    console.error("Error seeding themes:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedThemes();
