import "dotenv/config";

export const WS_PORT = Number(process.env.WS_PORT || 1234);
export const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  console.warn("❗ DATABASE_URL отсутствует. Создай server/.env");
}
