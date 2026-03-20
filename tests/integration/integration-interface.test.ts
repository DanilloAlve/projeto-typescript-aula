import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";

import { validarBody } from "../../src/middleware/validarBody.js";
import errorHandler from "../../src/middleware/errorHandler.js";
import { createAreaSchema } from "../../src/validats/createAreaSchema.js";
import AreaController from "../../src/controllers/AreaController.js";
import { asyncHandler } from "../../src/utils/asyncError.js";
import { AppError } from "../../src/errors/AppError.js";

describe("Integração + Interface (HTTP sem banco)", () => {
  it("integra route -> validarBody -> controller -> service", async () => {
    const fakeService = {
      create: async (data: any) => ({
        id: "area-1",
        ...data,
      }),
      findAll: async () => [{ id: "area-1", nome: "Reserva X" }],
      findById: async (id: string) => ({ id, nome: "Reserva X" }),
    };

    const controller = new AreaController(fakeService as any);
    const app = express();
    app.use(express.json());

    app.post(
      "/api/area",
      validarBody(createAreaSchema),
      asyncHandler(controller.create.bind(controller))
    );
    app.get("/api/area", asyncHandler(controller.findAll.bind(controller)));
    app.get("/api/area/:id", asyncHandler(controller.findById.bind(controller)));
    app.use(errorHandler);

    // Interface: valida payload inválido
    const invalidRes = await request(app).post("/api/area").send({
      nome: "Ar",
      bioma: "Inexistente",
      latitude: 999,
      longitude: 999,
      largura: 0,
      comprimento: 0,
    });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.status).toBe("validation-error");

    // Interface: fluxo de sucesso
    const createRes = await request(app).post("/api/area").send({
      nome: "Area Reserva",
      descricao: "desc",
      bioma: "Floresta",
      latitude: -10,
      longitude: -50,
      largura: 10,
      comprimento: 20,
      relevo: "ondulado",
    });
    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBe("area-1");

    const listRes = await request(app).get("/api/area");
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const byIdRes = await request(app).get("/api/area/area-1");
    expect(byIdRes.status).toBe(200);
    expect(byIdRes.body.id).toBe("area-1");
  });

  it("integra asyncHandler + errorHandler para AppError", async () => {
    const app = express();
    app.get(
      "/boom",
      asyncHandler(async () => {
        throw new AppError(404, "Não encontrado");
      })
    );
    app.use(errorHandler);

    const res = await request(app).get("/boom");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Não encontrado");
  });
});

