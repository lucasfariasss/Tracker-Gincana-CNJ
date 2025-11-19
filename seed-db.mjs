import { drizzle } from "drizzle-orm/mysql2";
import { requirements } from "./drizzle/schema.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não está definida");
  }

  const db = drizzle(process.env.DATABASE_URL);

  // Carregar dados do JSON
  const seedDataPath = join(__dirname, "seed-data.json");
  const seedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));

  console.log(`📊 Carregando ${seedData.length} requisitos...`);

  // Inserir em lotes para melhor performance
  const batchSize = 50;
  for (let i = 0; i < seedData.length; i += batchSize) {
    const batch = seedData.slice(i, i + batchSize);
    await db.insert(requirements).values(batch);
    console.log(`✓ Inseridos ${Math.min(i + batchSize, seedData.length)}/${seedData.length} requisitos`);
  }

  console.log("✅ Seed concluído com sucesso!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Erro ao executar seed:", error);
  process.exit(1);
});
