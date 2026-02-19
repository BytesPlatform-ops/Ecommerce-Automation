import { prisma } from "@/lib/prisma";

async function seedDemoStore() {
  try {
    // Check if demo store already exists
    const existingDemoStore = await prisma.store.findUnique({
      where: { subdomainSlug: "demo" },
    });

    if (existingDemoStore) {
      console.log("Demo store already exists");
      return;
    }

    // Get the Ocean theme (or any existing theme)
    const theme = await prisma.theme.findFirst({
      where: { name: "Ocean" },
    });

    if (!theme) {
      console.log("No theme found. Please seed themes first.");
      return;
    }

    // Create demo store
    const demoStore = await prisma.store.create({
      data: {
        ownerId: "demo-user", // Special ID for demo store
        subdomainSlug: "demo",
        storeName: "Bytescart Demo Store",
        aboutText:
          "Welcome to the Bytescart Demo Store! Explore our premium collection of curated products. This is a fully functional storefront showcasing what you can build with Bytescart.",
        themeId: theme.id,
        domainStatus: "Live",
      },
    });

    // Create sample products
    const sampleProducts = [
      {
        name: "Premium Wireless Headphones",
        price: 199.99,
        imageUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      },
      {
        name: "Luxury Watch Collection",
        price: 299.99,
        imageUrl:
          "https://images.unsplash.com/photo-1523170335684-f7fb0a7fb518?w=500&h=500&fit=crop",
      },
      {
        name: "Professional Camera Lens",
        price: 599.99,
        imageUrl:
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop",
      },
      {
        name: "Designer Sunglasses",
        price: 149.99,
        imageUrl:
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
      },
      {
        name: "Artisan Coffee Maker",
        price: 89.99,
        imageUrl:
          "https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=500&h=500&fit=crop",
      },
      {
        name: "Premium Leather Backpack",
        price: 249.99,
        imageUrl:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
      },
      {
        name: "Organic Skincare Set",
        price: 79.99,
        imageUrl:
          "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop",
      },
      {
        name: "Smart Home Hub",
        price: 129.99,
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
      },
      {
        name: "Ceramic Dinner Set",
        price: 159.99,
        imageUrl:
          "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop",
      },
      {
        name: "Portable Bluetooth Speaker",
        price: 99.99,
        imageUrl:
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
      },
      {
        name: "Premium Yoga Mat",
        price: 69.99,
        imageUrl:
          "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop",
      },
      {
        name: "Mechanical Keyboard",
        price: 179.99,
        imageUrl:
          "https://images.unsplash.com/photo-1587829191301-0117f0c75a61?w=500&h=500&fit=crop",
      },
    ];

    // Insert all products
    for (const product of sampleProducts) {
      await prisma.product.create({
        data: {
          storeId: demoStore.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        },
      });
    }

    console.log(
      `✅ Demo store created with ${sampleProducts.length} sample products`
    );
  } catch (error) {
    console.error("Error seeding demo store:", error);
    throw error;
  }
}

seedDemoStore();
