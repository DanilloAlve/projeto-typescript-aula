import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";

import { read, write } from "../../src/utils/sensorFile.js";

describe("Utils (sensorFile)", () => {
  it("write + read - grava e lê JSON no diretório src/database", async () => {
    const fileName = "__vitest_sensorfile_tmp.json";
    const fullPath = path.resolve(process.cwd(), "src", "database", fileName);

    const payload = { ok: true, createdAt: new Date().toISOString() };

    await write(fileName, payload);
    const result = await read(fileName);

    expect(result.ok).toBe(true);

    // Cleanup
    await fs.unlink(fullPath);
  });

  it("read - lança erro quando arquivo não existe", async () => {
    await expect(read("__arquivo_que_nao_existe__.json")).rejects.toThrow(
      "Erro ao ler o arquivo"
    );
  });
});

