import { AppDataSource } from "./data-source.js";
import { WordPack } from "../entities/WordPack.js";
import { Word } from "../entities/Word.js";

export async function listPacks() {
  const repo = AppDataSource.getRepository(WordPack);
  const packs = await repo.find({ order: { name: "ASC" } });
  return packs.map((p) => ({
    id: p.id,
    name: p.name,
    difficulty: p.difficulty
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
    difficulty: params.difficulty
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

  return { id: pack.id, name: pack.name, difficulty: pack.difficulty };
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
