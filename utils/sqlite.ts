import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "app.sqlite");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

export default db;
