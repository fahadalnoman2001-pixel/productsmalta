import { PrismaClient } from "@prisma/client";

function slugify(s: string) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const tools = [
  {
    name: "list_products",
    description: "List products with optional filters. Returns up to 100 by default.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "category slug" },
        brand: { type: "string" },
        platform: { type: "string" },
        isFeatured: { type: "boolean" },
        isBestSeller: { type: "boolean" },
        search: { type: "string" },
        limit: { type: "integer", default: 100 }
      }
    }
  },
  {
    name: "get_product",
    description: "Get a single product by id or slug.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, slug: { type: "string" } } }
  },
  {
    name: "create_product",
    description: "Create a new product. Slug auto-generated if omitted.",
    inputSchema: {
      type: "object",
      required: ["title", "description", "price", "affiliateUrl"],
      properties: {
        title: { type: "string" },
        slug: { type: "string" },
        description: { type: "string" },
        shortDesc: { type: "string" },
        images: { type: "array", items: { type: "string" } },
        price: { type: "number" },
        originalPrice: { type: "number" },
        currency: { type: "string", default: "EUR" },
        brand: { type: "string" },
        platform: { type: "string" },
        affiliateUrl: { type: "string" },
        rating: { type: "number" },
        reviewCount: { type: "integer" },
        categorySlug: { type: "string" },
        subcategorySlug: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        seoTitle: { type: "string" },
        seoDescription: { type: "string" },
        isFeatured: { type: "boolean" },
        isBestSeller: { type: "boolean" }
      }
    }
  },
  {
    name: "update_product",
    description: "Update fields on a product identified by id or slug.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, slug: { type: "string" }, patch: { type: "object" } },
      required: ["patch"]
    }
  },
  {
    name: "delete_product",
    description: "Delete a product by id or slug.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, slug: { type: "string" } } }
  },
  {
    name: "search_products",
    description: "Search products by keyword across title & description.",
    inputSchema: { type: "object", required: ["query"], properties: { query: { type: "string" }, limit: { type: "integer", default: 20 } } }
  },

  {
    name: "list_blogs",
    description: "List blog posts, optionally filtered by category slug.",
    inputSchema: { type: "object", properties: { category: { type: "string" }, limit: { type: "integer", default: 50 } } }
  },
  {
    name: "create_blog",
    description: "Create a blog post.",
    inputSchema: {
      type: "object",
      required: ["title", "content"],
      properties: {
        title: { type: "string" },
        slug: { type: "string" },
        excerpt: { type: "string" },
        content: { type: "string", description: "Markdown supported" },
        coverImage: { type: "string" },
        author: { type: "string" },
        categorySlug: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        seoTitle: { type: "string" },
        seoDescription: { type: "string" },
        isPublished: { type: "boolean", default: true },
        isTop: { type: "boolean" }
      }
    }
  },
  {
    name: "update_blog",
    description: "Update a blog by id or slug.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, slug: { type: "string" }, patch: { type: "object" } },
      required: ["patch"]
    }
  },
  {
    name: "delete_blog",
    description: "Delete a blog by id or slug.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, slug: { type: "string" } } }
  },

  {
    name: "list_categories",
    description: "List all categories with subcategories.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "create_category",
    description: "Create a top-level category.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        slug: { type: "string" },
        description: { type: "string" },
        image: { type: "string" },
        showOnHomepage: { type: "boolean", description: "show this category's product row on the homepage" }
      }
    }
  },
  {
    name: "update_category",
    description: "Update a category by slug (e.g. toggle showOnHomepage, rename, set image).",
    inputSchema: { type: "object", required: ["slug", "patch"], properties: { slug: { type: "string" }, patch: { type: "object" } } }
  },
  {
    name: "create_subcategory",
    description: "Create a subcategory under a category (by slug).",
    inputSchema: {
      type: "object",
      required: ["name", "categorySlug"],
      properties: { name: { type: "string" }, slug: { type: "string" }, categorySlug: { type: "string" } }
    }
  },
  {
    name: "delete_category",
    description: "Delete a category (cascades subcategories).",
    inputSchema: { type: "object", required: ["slug"], properties: { slug: { type: "string" } } }
  },

  {
    name: "list_collections",
    description: "List all collections with attached products.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "create_collection",
    description: "Create a collection (manual, featured, bestseller, seasonal).",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        slug: { type: "string" },
        type: { type: "string" },
        description: { type: "string" },
        showOnHomepage: { type: "boolean", description: "show this collection as a row on the homepage" }
      }
    }
  },
  {
    name: "update_collection",
    description: "Update a collection by slug (e.g. toggle showOnHomepage, rename).",
    inputSchema: { type: "object", required: ["slug", "patch"], properties: { slug: { type: "string" }, patch: { type: "object" } } }
  },
  {
    name: "add_product_to_collection",
    description: "Add a product (by slug) to a collection (by slug).",
    inputSchema: {
      type: "object",
      required: ["collectionSlug", "productSlug"],
      properties: { collectionSlug: { type: "string" }, productSlug: { type: "string" } }
    }
  },
  {
    name: "remove_product_from_collection",
    description: "Remove a product from a collection.",
    inputSchema: {
      type: "object",
      required: ["collectionSlug", "productSlug"],
      properties: { collectionSlug: { type: "string" }, productSlug: { type: "string" } }
    }
  },

  {
    name: "list_banners",
    description: "List banners, optionally by slot (hero/category/promo/sidebar).",
    inputSchema: { type: "object", properties: { slot: { type: "string" } } }
  },
  {
    name: "create_banner",
    description: "Create a homepage banner or category poster.",
    inputSchema: {
      type: "object",
      required: ["title", "image"],
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        image: { type: "string" },
        link: { type: "string" },
        slot: { type: "string", default: "hero" },
        slotKey: { type: "string" },
        order: { type: "integer" }
      }
    }
  },
  {
    name: "delete_banner",
    description: "Delete a banner by id.",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } }
  },

  {
    name: "get_settings",
    description: "Get all site settings as a key-value object.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "update_setting",
    description: "Set a single site setting.",
    inputSchema: { type: "object", required: ["key", "value"], properties: { key: { type: "string" }, value: { type: "string" } } }
  },

  {
    name: "get_dashboard_stats",
    description: "Return counts and top-click stats.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "get_top_products",
    description: "Return most-clicked products.",
    inputSchema: { type: "object", properties: { limit: { type: "integer", default: 10 } } }
  }
];

async function findProduct(prisma: PrismaClient, { id, slug }: { id?: string; slug?: string }) {
  if (id) return prisma.product.findUnique({ where: { id } });
  if (slug) return prisma.product.findUnique({ where: { slug } });
  return null;
}

async function findBlog(prisma: PrismaClient, { id, slug }: { id?: string; slug?: string }) {
  if (id) return prisma.blog.findUnique({ where: { id } });
  if (slug) return prisma.blog.findUnique({ where: { slug } });
  return null;
}

export async function dispatch(prisma: PrismaClient, name: string, args: any) {
  switch (name) {
    case "list_products": {
      const where: any = { isActive: true };
      if (args.brand) where.brand = args.brand;
      if (args.platform) where.platform = args.platform;
      if (args.isFeatured != null) where.isFeatured = args.isFeatured;
      if (args.isBestSeller != null) where.isBestSeller = args.isBestSeller;
      if (args.search) where.OR = [{ title: { contains: args.search } }, { description: { contains: args.search } }];
      if (args.category) {
        const c = await prisma.category.findUnique({ where: { slug: args.category } });
        if (c) where.categoryId = c.id;
      }
      return prisma.product.findMany({
        where,
        include: { category: true, subcategory: true },
        take: args.limit || 100,
        orderBy: { createdAt: "desc" }
      });
    }
    case "get_product":
      return findProduct(prisma, args);
    case "create_product": {
      const cat = args.categorySlug ? await prisma.category.findUnique({ where: { slug: args.categorySlug } }) : null;
      const sub = args.subcategorySlug ? await prisma.subcategory.findUnique({ where: { slug: args.subcategorySlug } }) : null;
      return prisma.product.create({
        data: {
          title: args.title,
          slug: args.slug || slugify(args.title),
          description: args.description,
          shortDesc: args.shortDesc,
          images: JSON.stringify(args.images || []),
          price: Number(args.price) || 0,
          originalPrice: args.originalPrice ? Number(args.originalPrice) : null,
          currency: args.currency || "EUR",
          brand: args.brand,
          platform: args.platform,
          affiliateUrl: args.affiliateUrl,
          rating: args.rating ?? 4.5,
          reviewCount: args.reviewCount ?? 0,
          categoryId: cat?.id,
          subcategoryId: sub?.id,
          tags: JSON.stringify(args.tags || []),
          seoTitle: args.seoTitle,
          seoDescription: args.seoDescription,
          isFeatured: !!args.isFeatured,
          isBestSeller: !!args.isBestSeller
        }
      });
    }
    case "update_product": {
      const p = await findProduct(prisma, args);
      if (!p) throw new Error("product not found");
      const patch = { ...args.patch };
      if (patch.images && Array.isArray(patch.images)) patch.images = JSON.stringify(patch.images);
      if (patch.tags && Array.isArray(patch.tags)) patch.tags = JSON.stringify(patch.tags);
      if (patch.categorySlug) {
        const c = await prisma.category.findUnique({ where: { slug: patch.categorySlug } });
        if (c) patch.categoryId = c.id;
        delete patch.categorySlug;
      }
      return prisma.product.update({ where: { id: p.id }, data: patch });
    }
    case "delete_product": {
      const p = await findProduct(prisma, args);
      if (!p) throw new Error("product not found");
      await prisma.product.delete({ where: { id: p.id } });
      return { deleted: true };
    }
    case "search_products":
      return prisma.product.findMany({
        where: { isActive: true, OR: [{ title: { contains: args.query } }, { description: { contains: args.query } }] },
        include: { category: true },
        take: args.limit || 20
      });

    case "list_blogs": {
      const where: any = {};
      if (args.category) {
        const c = await prisma.category.findUnique({ where: { slug: args.category } });
        if (c) where.categoryId = c.id;
      }
      return prisma.blog.findMany({ where, include: { category: true }, take: args.limit || 50, orderBy: { createdAt: "desc" } });
    }
    case "create_blog": {
      const cat = args.categorySlug ? await prisma.category.findUnique({ where: { slug: args.categorySlug } }) : null;
      return prisma.blog.create({
        data: {
          title: args.title,
          slug: args.slug || slugify(args.title),
          excerpt: args.excerpt,
          content: args.content,
          coverImage: args.coverImage,
          author: args.author || "Admin",
          categoryId: cat?.id,
          tags: JSON.stringify(args.tags || []),
          seoTitle: args.seoTitle,
          seoDescription: args.seoDescription,
          isPublished: args.isPublished !== false,
          isTop: !!args.isTop
        }
      });
    }
    case "update_blog": {
      const b = await findBlog(prisma, args);
      if (!b) throw new Error("blog not found");
      const patch = { ...args.patch };
      if (patch.tags && Array.isArray(patch.tags)) patch.tags = JSON.stringify(patch.tags);
      if (patch.categorySlug) {
        const c = await prisma.category.findUnique({ where: { slug: patch.categorySlug } });
        if (c) patch.categoryId = c.id;
        delete patch.categorySlug;
      }
      return prisma.blog.update({ where: { id: b.id }, data: patch });
    }
    case "delete_blog": {
      const b = await findBlog(prisma, args);
      if (!b) throw new Error("blog not found");
      await prisma.blog.delete({ where: { id: b.id } });
      return { deleted: true };
    }

    case "list_categories":
      return prisma.category.findMany({ include: { subcategories: true }, orderBy: { order: "asc" } });
    case "create_category":
      return prisma.category.create({
        data: {
          name: args.name,
          slug: args.slug || slugify(args.name),
          description: args.description,
          image: args.image,
          showOnHomepage: args.showOnHomepage !== false
        }
      });
    case "update_category": {
      const c = await prisma.category.findUnique({ where: { slug: args.slug } });
      if (!c) throw new Error("category not found");
      const patch = { ...args.patch };
      delete patch.subcategories;
      return prisma.category.update({ where: { id: c.id }, data: patch });
    }
    case "create_subcategory": {
      const c = await prisma.category.findUnique({ where: { slug: args.categorySlug } });
      if (!c) throw new Error("category not found");
      return prisma.subcategory.create({ data: { name: args.name, slug: args.slug || slugify(args.name), categoryId: c.id } });
    }
    case "delete_category":
      await prisma.category.delete({ where: { slug: args.slug } });
      return { deleted: true };

    case "list_collections":
      return prisma.collection.findMany({ include: { products: { include: { product: true } } }, orderBy: { order: "asc" } });
    case "create_collection":
      return prisma.collection.create({
        data: {
          name: args.name,
          slug: args.slug || slugify(args.name),
          type: args.type || "manual",
          description: args.description,
          showOnHomepage: args.showOnHomepage !== false
        }
      });
    case "update_collection": {
      const c = await prisma.collection.findUnique({ where: { slug: args.slug } });
      if (!c) throw new Error("collection not found");
      const patch = { ...args.patch };
      delete patch.products;
      return prisma.collection.update({ where: { id: c.id }, data: patch });
    }
    case "add_product_to_collection": {
      const c = await prisma.collection.findUnique({ where: { slug: args.collectionSlug } });
      const p = await prisma.product.findUnique({ where: { slug: args.productSlug } });
      if (!c || !p) throw new Error("collection or product not found");
      return prisma.collectionProduct.upsert({
        where: { collectionId_productId: { collectionId: c.id, productId: p.id } },
        update: {},
        create: { collectionId: c.id, productId: p.id }
      });
    }
    case "remove_product_from_collection": {
      const c = await prisma.collection.findUnique({ where: { slug: args.collectionSlug } });
      const p = await prisma.product.findUnique({ where: { slug: args.productSlug } });
      if (!c || !p) throw new Error("collection or product not found");
      await prisma.collectionProduct.delete({ where: { collectionId_productId: { collectionId: c.id, productId: p.id } } });
      return { removed: true };
    }

    case "list_banners":
      return prisma.banner.findMany({ where: args.slot ? { slot: args.slot } : {}, orderBy: [{ slot: "asc" }, { order: "asc" }] });
    case "create_banner":
      return prisma.banner.create({
        data: {
          title: args.title,
          subtitle: args.subtitle,
          image: args.image,
          link: args.link,
          slot: args.slot || "hero",
          slotKey: args.slotKey,
          order: args.order || 0
        }
      });
    case "delete_banner":
      await prisma.banner.delete({ where: { id: args.id } });
      return { deleted: true };

    case "get_settings": {
      const rows = await prisma.setting.findMany();
      return Object.fromEntries(rows.map((r) => [r.key, r.value]));
    }
    case "update_setting":
      return prisma.setting.upsert({ where: { key: args.key }, update: { value: args.value }, create: { key: args.key, value: args.value } });

    case "get_dashboard_stats": {
      const [productCount, blogCount, categoryCount, collectionCount, clickCount] = await Promise.all([
        prisma.product.count(),
        prisma.blog.count(),
        prisma.category.count(),
        prisma.collection.count(),
        prisma.clickLog.count()
      ]);
      return { products: productCount, blogs: blogCount, categories: categoryCount, collections: collectionCount, clicks: clickCount };
    }
    case "get_top_products":
      return prisma.product.findMany({ orderBy: { clicks: "desc" }, take: args.limit || 10, include: { category: true } });

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
