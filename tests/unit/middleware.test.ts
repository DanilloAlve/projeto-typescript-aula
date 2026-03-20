import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { z } from "zod";

import errorHandler from "../../src/middleware/errorHandler.js";
import { validarBody } from "../../src/middleware/validarBody.js";
import { authMiddleware } from "../../src/middleware/authMidd.js";
import { asyncHandler } from "../../src/utils/asyncError.js";
import { jwtConfig } from "../../src/config/jwt.config.js";
import { AppError } from "../../src/errors/AppError.js";

describe("Middlewares (validação/auth/erros)", () => {
  it("validarBody - retorna 400 e formato de validation-error", async () => {
    const app = express();
    app.use(express.json());
    app.post(
      "/t",
      validarBody(
        z.object({
          nome: z.string().min(3),
        })
      ),
      (_req, res) => res.status(200).json({ ok: true })
    );
    app.use(errorHandler);

    const res = await request(app).post("/t").send({ nome: "ab" });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe("validation-error");
    expect(Array.isArray(res.body.error)).toBe(true);
  });

  it("authMiddleware - rejeita sem token", async () => {
    const app = express();
    app.get("/secure", authMiddleware, (_req, res) => res.json({ ok: true }));
    app.use(errorHandler);

    const res = await request(app).get("/secure");
    expect(res.status).toBe(401);
  });

  it("authMiddleware - aceita token access e injeta req.user", async () => {
    const app = express();
    app.get("/secure", authMiddleware, (req, res) => res.json(req.user));
    app.use(errorHandler);

    const token = jwt.sign(
      { sub: "user-1", email: "a@b.com", type: "access" },
      jwtConfig.access.secret,
      { expiresIn: jwtConfig.access.expiresIn }
    );

    const res = await request(app).get("/secure").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.sub).toBe("user-1");
    expect(res.body.email).toBe("a@b.com");
  });

  it("authMiddleware - rejeita token com type != access", async () => {
    const app = express();
    app.get("/secure", authMiddleware, (_req, res) => res.json({ ok: true }));
    app.use(errorHandler);

    const token = jwt.sign(
      { sub: "user-1", email: "a@b.com", type: "refresh" },
      jwtConfig.access.secret,
      { expiresIn: jwtConfig.access.expiresIn }
    );

    const res = await request(app)
      .get("/secure")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  it("asyncHandler - propaga erro para errorHandler", async () => {
    const app = express();
    app.get(
      "/async",
      asyncHandler(async () => {
        throw new AppError(400, "Erro teste");
      })
    );
    app.use(errorHandler);

    const res = await request(app).get("/async");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Erro teste");
  });
});

