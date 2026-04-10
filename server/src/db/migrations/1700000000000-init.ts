import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE word_packs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text NOT NULL,
        difficulty int NOT NULL DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE words (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        text text NOT NULL,
        pack_id uuid NOT NULL REFERENCES word_packs(id) ON DELETE CASCADE
      )
    `);

    // Seed packs
    const animals = await queryRunner.query(`
      INSERT INTO word_packs(name,difficulty)
      VALUES ('Animals',1)
      RETURNING id
    `);

    const movies = await queryRunner.query(`
      INSERT INTO word_packs(name,difficulty)
      VALUES ('Movies',2)
      RETURNING id
    `);

    await queryRunner.query(
      `
      INSERT INTO words(text, pack_id)
      VALUES
      ('Cat',$1), ('Dog',$1), ('Lion',$1),
      ('Titanic',$2), ('Matrix',$2), ('Avatar',$2)
    `,
      [animals[0].id, movies[0].id]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE words");
    await queryRunner.query("DROP TABLE word_packs");
  }
}
