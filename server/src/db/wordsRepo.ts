import { AppDataSource } from "./data-source.js";
import { Word } from "../entities/Word.js";

export async function getRandomWords(limit: number) {
  const repo = AppDataSource.getRepository(Word);

  const words = await repo
    .createQueryBuilder("w")
    .orderBy("RANDOM()")
    .limit(limit)
    .getMany();

  return words.map((w) => ({
    id: w.id,
    text: w.text
  }));
}
