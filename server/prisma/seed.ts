import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

type ModelName = keyof typeof prisma;

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const baseName = path.basename(fileName, path.extname(fileName));
    return baseName === "taskAssignment" ? "taskAssignment" : baseName.replace("Team", "_team");
  });

  for (const modelName of modelNames) {
    console.log(`Attempting to access model: ${modelName}`);
    let model = (prisma as any)[modelName as ModelName];
    // Пробуем альтернативное имя с подчёркиванием, если camelCase не работает
    if (!model && modelName === "taskAssignment") {
      model = (prisma as any)["task_assignment"];
      console.log(`Trying fallback model name: task_assignment`);
    }
    if (model && typeof model.deleteMany === "function") {
      try {
        await model.deleteMany({});
        console.log(`Cleared data from ${modelName}`);
      } catch (error: unknown) {
        console.error(`Error clearing data from ${modelName}:`, (error as Error).message);
      }
    } else {
      console.warn(`Model ${modelName} not found in Prisma client or deleteMany is not available. Available models:`, Object.keys(prisma));
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "users.json",
    "project.json",
    "team.json",
    "projectTeam.json",
    "task.json",
    "attachment.json",
    "comment.json",
    "taskAssignment.json",
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    try {
      const jsonData = JSON.parse(await fs.readFile(filePath, "utf-8"));
      const baseName = path.basename(fileName, path.extname(fileName));
      const modelName = baseName === "taskAssignment" ? "taskAssignment" : baseName.replace("Team", "_team");
      console.log(`Attempting to seed into model: ${modelName}`);
      let model = (prisma as any)[modelName as ModelName];
      if (!model && modelName === "taskAssignment") {
        model = (prisma as any)["task_assignment"];
        console.log(`Trying fallback model name: task_assignment`);
      }

      if (!model || typeof model.create !== "function") {
        console.error(`Model ${modelName} not found in Prisma client or create is not available. Available models:`, Object.keys(prisma));
        continue;
      }

      const dataArray = Array.isArray(jsonData) ? jsonData : jsonData[modelName];
      if (!Array.isArray(dataArray)) {
        console.error(`Data in ${fileName} is not an array:`, jsonData);
        continue;
      }

      for (const data of dataArray) {
        try {
          await model.create({ data });
          console.log(`Seeded record in ${modelName}:`, data);
        } catch (error: unknown) {
          console.error(`Error seeding record in ${modelName}:`, data, (error as Error).message);
        }
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } catch (error: unknown) {
      console.error(`Error processing file ${fileName}:`, (error as Error).message);
    }
  }
}

main()
  .catch((e: unknown) => console.error("Error in main:", (e as Error).message))
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Disconnected from database");
  });