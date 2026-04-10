import { AppDataSource } from "./data-source.js";
import { WordPack } from "../entities/WordPack.js";
import { Word } from "../entities/Word.js";

export async function listPacks() {
  const repo = AppDataSource.getRepository(WordPack);
  const rows = await repo
    .createQueryBuilder("pack")
    .leftJoin(Word, "word", "word.pack_id = pack.id")
    .select("pack.id", "id")
    .addSelect("pack.name", "name")
    .addSelect("pack.difficulty", "difficulty")
    .addSelect("COUNT(word.id)", "wordsCount")
    .groupBy("pack.id")
    .addGroupBy("pack.name")
    .addGroupBy("pack.difficulty")
    .orderBy("pack.name", "ASC")
    .getRawMany<{
      id: string;
      name: string;
      difficulty: string | number;
      wordsCount: string | number;
    }>();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    difficulty: Number(row.difficulty),
    wordsCount: Number(row.wordsCount),
  }));
}

export async function createPackWithWords(params: {
  name: string;
  difficulty: number;
  words: string[];
}) {
  const packRepo = AppDataSource.getRepository(WordPack);
  const wordRepo = AppDataSource.getRepository(Word);

  const pack = packRepo.create({
    name: params.name.trim(),
    difficulty: params.difficulty,
  });

  await packRepo.save(pack);

  const uniqueWords = Array.from(
    new Set(
      params.words
        .map((w) => w.trim())
        .filter(Boolean)
        .map((w) => w.slice(0, 80))
    )
  );

  const entities = uniqueWords.map((t) =>
    wordRepo.create({ text: t, pack_id: pack.id })
  );

  await wordRepo.save(entities);

  return {
    id: pack.id,
    name: pack.name,
    difficulty: pack.difficulty,
    wordsCount: uniqueWords.length,
  };
}

export async function getRandomWordsFromPacks(params: {
  packIds: string[];
  limit: number;
}) {
  const wordRepo = AppDataSource.getRepository(Word);

  // если паков нет — берём вообще все слова
  const qb = wordRepo
    .createQueryBuilder("w")
    .select(["w.id", "w.text"])
    .orderBy("RANDOM()")
    .limit(params.limit);

  if (params.packIds.length > 0) {
    qb.where("w.pack_id = ANY(:packIds)", { packIds: params.packIds });
  }

  const words = await qb.getMany();
  return words.map((w) => ({ id: w.id, text: w.text }));
}
