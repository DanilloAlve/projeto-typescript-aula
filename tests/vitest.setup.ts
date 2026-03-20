import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Garante que o TypeORM habilite `synchronize` e que o jwtConfig encontre secrets.
process.env.NODE_ENV = "test";

dotenv.config({
  path: path.resolve(__dirname, "..", ".env-didatico"),
});

