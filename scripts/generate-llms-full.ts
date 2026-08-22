import { prisma } from "../src/lib/db";
import fs from "fs";
import path from "path";

async function main() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        title: true,
        slug: true,
        shortDesc: true,
        price: true,
        currency: true,
        brand: true
      }
    });

    const header = `# YourOffers.eu — Full Product Index\n\n`;
    const body = products
      .map(
        p =>
          `## ${p.title}\n- URL: https://youroffers.eu/products/${p.slug}\n- Brand: ${
            p.brand || "—"
          }\n- Price: ${p.price} ${p.currency}\n- ${p.shortDesc || ""}\n`
      )
      .join("\n");

    const outputPath = path.join(process.cwd(), "public", "llms-full.txt");
    fs.writeFileSync(outputPath, header + body);
    console.log(`Generated ${outputPath} with ${products.length} products`);
  } catch (error) {
    console.error("Error generating llms-full.txt:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
