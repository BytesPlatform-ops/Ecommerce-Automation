"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function createProduct(
  storeId: string,
  data: { name: string; price: number; imageUrl?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  const product = await prisma.product.create({
    data: {
      storeId,
      name: data.name,
      price: data.price,
      imageUrl: data.imageUrl || null,
    },
  });
  
  return {
    ...product,
    price: product.price.toString(),
  };
}

export async function updateProduct(
  productId: string,
  data: { name: string; price: number; imageUrl?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify product ownership via store
  const existingProduct = await prisma.product.findFirst({
    where: { id: productId },
    include: { store: true },
  });

  if (!existingProduct || existingProduct.store.ownerId !== user.id) {
    throw new Error("Product not found or unauthorized");
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      price: data.price,
      imageUrl: data.imageUrl ?? undefined,
    },
  });
  
  return {
    ...product,
    price: product.price.toString(),
  };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify product ownership via store
  const product = await prisma.product.findFirst({
    where: { id: productId },
    include: { store: true },
  });

  if (!product || product.store.ownerId !== user.id) {
    throw new Error("Product not found or unauthorized");
  }

  return await prisma.product.delete({
    where: { id: productId },
  });
}

export async function updateStore(
  storeId: string,
  data: { storeName?: string; aboutText?: string; themeId?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: user.id },
  });

  if (!store) {
    throw new Error("Store not found or unauthorized");
  }

  return await prisma.store.update({
    where: { id: storeId },
    data: {
      storeName: data.storeName,
      aboutText: data.aboutText,
      themeId: data.themeId,
    },
  });
}

export async function getProduct(productId: string) {
  return await prisma.product.findUnique({
    where: { id: productId },
  });
}

export async function getUserStore() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return await prisma.store.findFirst({
    where: { ownerId: user.id },
    include: { theme: true },
  });
}

export async function createStore(
  userId: string,
  data: { storeName: string; subdomainSlug: string; themeId: string }
) {
  // Verify slug uniqueness
  const existingStore = await prisma.store.findUnique({
    where: { subdomainSlug: data.subdomainSlug },
  });

  if (existingStore) {
    throw new Error("This store name is already taken. Please choose another.");
  }

  return await prisma.store.create({
    data: {
      ownerId: userId,
      storeName: data.storeName,
      subdomainSlug: data.subdomainSlug,
      themeId: data.themeId,
    },
  });
}
