import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { createAreaSchema } from "../../src/validats/createAreaSchema.js";
import { createLeituraSchema } from "../../src/validats/createLeituraSchema.js";
import { createPesquisadorSchema } from "../../src/validats/createPesquisadorSchema.js";
import { createSensorSchema } from "../../src/validats/createSensorSchema.js";

describe("Schemas Zod (validações)", () => {
  it("createPesquisadorSchema - aceita payload válido", async () => {
    const input = {
      nome: "João",
      email: "joao@email.com",
      senha: "minimo8chars",
      especialidade: "Biologia",
      titulacao: "Mestrado",
      matricula: "MAT001",
      linhaPesquisa: "Genética",
      dataNascimento: "1995-05-20",
    };

    const parsed = await createPesquisadorSchema.parseAsync(input);
    expect(parsed.email).toBe("joao@email.com");
    expect(parsed.senha).toBe("minimo8chars");
  });

  it("createPesquisadorSchema - rejeita senha curta e titulacao inválida", async () => {
    const input = {
      nome: "João",
      email: "joao@email.com",
      senha: "123",
      especialidade: "Biologia",
      titulacao: "CargoInexistente",
      matricula: "MAT001",
      dataNascimento: "1995-05-20",
    };

    try {
      await createPesquisadorSchema.parseAsync(input);
      throw new Error("Deveria falhar");
    } catch (err) {
      expect(err).toBeInstanceOf(ZodError);
      const zerr = err as ZodError;
      // Mensagens variam; validar apenas se teve issues para campos diferentes.
      const fields = zerr.issues.map((i) => i.path[0]);
      expect(fields).toContain("senha");
      expect(fields).toContain("titulacao");
    }
  });

  it("createAreaSchema - rejeita bioma inválido", async () => {
    const input = {
      nome: "Reserva",
      descricao: "desc",
      bioma: "Marte",
      latitude: -10,
      longitude: -50,
      largura: 10,
      comprimento: 20,
      relevo: "algo",
    };

    try {
      await createAreaSchema.parseAsync(input);
      throw new Error("Deveria falhar");
    } catch (err) {
      expect(err).toBeInstanceOf(ZodError);
      const zerr = err as ZodError;
      expect(zerr.issues.some((i) => i.path[0] === "bioma")).toBe(true);
    }
  });

  it("createSensorSchema - rejeita status inválido", async () => {
    const input = {
      serialNumber: "SN-1",
      fabricante: "ACME",
      modelo: "M1",
      tipo: "Sensor",
      status: "Desconhecido",
      ipFixo: "127.0.0.1",
      dataInstalacao: "2024-01-01",
      dataManutencao: null,
      cicloLeitura: 10,
      latitude: -10,
      longitude: -50,
      finalidade: "monitorar",
      area_id: "uuid-area-1",
    };

    try {
      await createSensorSchema.parseAsync(input);
      throw new Error("Deveria falhar");
    } catch (err) {
      expect(err).toBeInstanceOf(ZodError);
      const zerr = err as ZodError;
      expect(zerr.issues.some((i) => i.path[0] === "status")).toBe(true);
    }
  });

  it("createLeituraSchema - aceita valores válidos", async () => {
    const input = {
      umidade: 40,
      temperatura: 20,
      dataHora: "2024-03-11T10:00:00.000Z",
    };
    const parsed = await createLeituraSchema.parseAsync(input);
    expect(typeof parsed.umidade).toBe("number");
    expect(parsed.dataHora instanceof Date).toBe(true);
  });
});

