import { DataSource } from "typeorm";
import { DATABASE_URL } from "../env.js";
import { WordPack } from "../entities/WordPack.js";
import { Word } from "../entities/Word.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: DATABASE_URL,
  entities: [WordPack, Word],
  migrations: ["src/db/migrations/*.ts"],
  synchronize: false
});
