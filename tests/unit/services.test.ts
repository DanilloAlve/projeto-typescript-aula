import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import bcrypt from "bcryptjs";

import { appDataSource } from "../../src/database/appDataSource.js";
import { AppError } from "../../src/errors/AppError.js";

import AuthService from "../../src/services/AuthService.js";
import LogoutService from "../../src/services/LogoutService.js";
import RefreshTokenService from "../../src/services/RefreshTokenService.js";
import PesquisadorService from "../../src/services/PesquisadorService.js";
import AreaService from "../../src/services/AreaService.js";
import SensorService from "../../src/services/SensorService.js";
import LeituraService from "../../src/services/LeituraService.js";

import Pesquisador from "../../src/entities/Pesquisador.js";
import Area from "../../src/entities/Area.js";
import { Sensor } from "../../src/entities/Sensor.js";
import Leitura from "../../src/entities/Leitura.js";
import RefreshToken from "../../src/entities/RefreshToken.js";

// Repositórios mockados (TypeORM repository-like)
const mockRepo = () => ({
  find: vi.fn(),
  findOne: vi.fn(),
  findOneBy: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  merge: vi.fn((a: any, b: any) => ({ ...a, ...b })),
  remove: vi.fn(),
  createQueryBuilder: vi.fn(),
});

describe("Serviços (unit com mocks)", () => {
  const repoPesquisador = mockRepo();
  const repoRefresh = mockRepo();
  const repoArea = mockRepo();
  const repoSensor = mockRepo();
  const repoLeitura = mockRepo();

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(appDataSource, "getRepository").mockImplementation((entity: any) => {
      switch (entity) {
        case Pesquisador:
          return repoPesquisador as any;
        case RefreshToken:
          return repoRefresh as any;
        case Area:
          return repoArea as any;
        case Sensor:
          return repoSensor as any;
        case Leitura:
          return repoLeitura as any;
        default:
          throw new Error(`Repo mock não definido para ${String(entity?.name)}`);
      }
    });

    // Reset de calls/retornos
    for (const r of [repoPesquisador, repoRefresh, repoArea, repoSensor, repoLeitura]) {
      for (const k of Object.keys(r)) {
        const v = (r as any)[k];
        if (typeof v === "function") (v as any).mockReset();
      }
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("PesquisadorService - create: falha quando email ou matrícula já existem", async () => {
    repoPesquisador.findOneBy.mockImplementation(({ email, matricula }: any) => {
      if (email) return { id: "x", email };
      if (matricula) return { id: "y", matricula };
      return null;
    });
    const service = new PesquisadorService();

    await expect(
      service.create({
        id: "z",
        nome: "Jo",
        email: "dup@email.com",
        senha: "minimo8chars",
        matricula: "MAT001",
        titulacao: "Mestrado",
        dataNascimento: new Date("1995-05-20"),
        linhaPesquisa: undefined,
        especialidade: "Biologia",
      } as any)
    ).rejects.toBeInstanceOf(AppError);
  });

  it("PesquisadorService - create: sucesso (hash de senha e save)", async () => {
    repoPesquisador.findOneBy.mockResolvedValue(null);
    repoPesquisador.create.mockImplementation((x: any) => x);
    repoPesquisador.save.mockImplementation(async (x: any) => ({
      ...x,
      id: "pesq-1",
      senha: x.senha,
    }));

    const service = new PesquisadorService();
    const result = await service.create({
      id: "z",
      nome: "Jo",
      email: "unique@email.com",
      senha: "minimo8chars",
      especialidade: "Biologia",
      titulacao: "Mestrado",
      matricula: "MAT-UNICA",
      dataNascimento: new Date("1995-05-20"),
      linhaPesquisa: undefined,
    } as any);

    expect(result.id).toBe("z");
    // senha deve ter sido substituída (hash)
    expect(result.senha).not.toBe("minimo8chars");
    expect(repoPesquisador.save).toHaveBeenCalled();
  });

  it("PesquisadorService - findById: 404 quando não encontrado", async () => {
    repoPesquisador.findOneBy.mockResolvedValue(null);
    const service = new PesquisadorService();

    await expect(service.findById("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("PesquisadorService - update: 404 quando não existe", async () => {
    repoPesquisador.findOneBy.mockResolvedValue(null);
    const service = new PesquisadorService();
    await expect(
      service.update("missing", {
        nome: "novo",
      } as any)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("PesquisadorService - delete: 404 quando não existe", async () => {
    repoPesquisador.findOneBy.mockResolvedValue(null);
    const service = new PesquisadorService();
    await expect(service.delete("missing")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("AreaService - contarSensorPorArea: retorna contagem por status Ativo", async () => {
    const nowArea = {
      id: "area-1",
      sensores: [
        { status: "Ativo" },
        { status: "Ativo" },
        { status: "Inativo" },
      ],
    } as any;
    repoArea.findOne.mockResolvedValue(nowArea);

    const service = new AreaService();
    const result = await service.contarSensorPorArea("area-1");

    expect(result.total).toBe(3);
    expect(result.ativos).toBe(2);
    expect(result.inativos).toBe(1);
  });

  it("AreaService - findById: 404 quando não encontrada", async () => {
    repoArea.findOne.mockResolvedValue(null);
    const service = new AreaService();
    await expect(service.findById("  area-missing  ")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("AreaService - findLeiturasByArea: lança AppError quando área não existe", async () => {
    repoArea.findOne.mockResolvedValue(null);
    const service = new AreaService();
    await expect(service.findLeiturasByArea("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("SensorService - addSensor: 404 quando área não existe", async () => {
    repoSensor.findOne.mockResolvedValue(null);
    repoArea.findOne.mockResolvedValue(null);

    const service = new SensorService();
    await expect(
      service.addSensor({
        serialNumber: "SN-1",
        fabricante: "ACME",
        modelo: "M1",
        tipo: "Sensor",
        status: "Ativo",
        area_id: "area-missing",
        dataInstalacao: new Date("2024-01-01"),
        cicloLeitura: 10,
        latitude: 0,
        longitude: 0,
      } as any)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("SensorService - addSensor: 400 quando serialNumber já cadastrado", async () => {
    repoSensor.findOne.mockResolvedValue({ id: "sensor-exists" });
    const service = new SensorService();
    await expect(
      service.addSensor({
        serialNumber: "SN-1",
        area_id: "area-1",
      } as any)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("SensorService - updateSensor: sucesso (merge+save)", async () => {
    repoSensor.findOneBy.mockResolvedValue({ id: "s-1", status: "Inativo" });
    repoSensor.create.mockImplementation((x: any) => x);
    repoSensor.merge.mockImplementation((a: any, b: any) => ({ ...a, ...b }));

    repoSensor.save.mockImplementation(async (x: any) => x);

    const service = new SensorService();
    const result = await service.updateSensor("s-1", { status: "Ativo" } as any);
    expect(result.status).toBe("Ativo");
    expect(repoSensor.save).toHaveBeenCalled();
  });

  it("SensorService - deleteSensor: remove quando existe", async () => {
    repoSensor.findOneBy.mockResolvedValue({ id: "s-1" });
    repoSensor.remove.mockResolvedValue(undefined);

    const service = new SensorService();
    await service.deleteSensor("s-1");
    expect(repoSensor.remove).toHaveBeenCalled();
  });

  it("LeituraService - listarLeiturasPorArea: monta labels/arrays a partir de rows", async () => {
    const rows = [
      {
        dataHora: new Date("2024-03-11T10:00:00.000Z"),
        temperatura: 20,
        umidade: 40,
      },
      {
        dataHora: new Date("2024-03-11T10:01:00.000Z"),
        temperatura: 21,
        umidade: 41,
      },
    ];

    repoLeitura.createQueryBuilder.mockReturnValue({
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue(rows),
    });

    const service = new LeituraService();
    const result = await service.listarLeiturasPorArea("area-1");

    expect(result.labels.length).toBe(2);
    expect(result.temperatura).toEqual([20, 21]);
    expect(result.umidade).toEqual([40, 41]);
  });

  it("LeituraService - create: 404 quando sensor não existe", async () => {
    repoSensor.findOne.mockResolvedValue(null);
    const service = new LeituraService();
    await expect(
      service.create({
        umidade: 40,
        temperatura: 20,
        sensor_id: "sensor-missing",
        dataHora: "2024-03-11T10:00:00.000Z",
      } as any)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("AuthService - login: falha quando pesquisador não existe", async () => {
    repoPesquisador.findOne.mockResolvedValue(null);

    const service = new AuthService();
    await expect(
      service.login("no@email.com", "senha", "ua", "127.0.0.1")
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("AuthService - login: gera tokens e cria refresh token quando necessário", async () => {
    const hashed = await bcrypt.hash("minhaSenha", 10);
    repoPesquisador.findOne.mockResolvedValue({
      id: "pesq-1",
      email: "a@b.com",
      senha: hashed,
    });

    repoRefresh.findOne.mockResolvedValue(null);

    repoRefresh.create.mockImplementation((x: any) => x);
    repoRefresh.save.mockImplementation(async (x: any) => ({
      ...x,
      id: "refresh-1",
      jti: x.jti ?? "jti-1",
      sessionId: x.sessionId,
      pesquisador: x.pesquisador,
    }));
    repoRefresh.update.mockResolvedValue(undefined);

    const service = new AuthService();
    const tokens = await service.login("a@b.com", "minhaSenha", "ua-x", "127.0.0.1");

    expect(typeof tokens.tokenAccess).toBe("string");
    expect(typeof tokens.tokenRefresh).toBe("string");
  });

  it("AuthService - login: rejeita senha inválida", async () => {
    const hashed = await bcrypt.hash("senha-certa", 10);
    repoPesquisador.findOne.mockResolvedValue({
      id: "pesq-1",
      email: "a@b.com",
      senha: hashed,
    });

    repoRefresh.findOne.mockResolvedValue(null);

    const service = new AuthService();
    await expect(service.login("a@b.com", "senha-errada", "ua-x", "127.0.0.1")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("RefreshTokenService - refresh: sucesso (revoga e gera novo tokens)", async () => {
    const jti = "jti-rt-1";
    const tokenDb: any = {
      id: "rt-db-1",
      jti,
      tokenhash: "will-be-overwritten",
      expireIn: new Date(Date.now() + 60_000),
      revoked: false,
      userAgent: "ua",
      ipAddress: "127.0.0.1",
      sessionId: "sess-1",
      pesquisador: { id: "p-1", email: "a@b.com" },
    };

    const { default: jwt } = await import("jsonwebtoken");
    const { jwtConfig } = await import("../../src/config/jwt.config.js");
    const refreshToken = jwt.sign({ sub: "p-1", jti, type: "refresh" }, jwtConfig.refresh.secret, {
      expiresIn: jwtConfig.refresh.expiresIn,
    });

    tokenDb.tokenhash = await bcrypt.hash(refreshToken, 12);

    repoRefresh.findOne.mockResolvedValue(tokenDb);
    repoRefresh.save.mockImplementation(async (x: any) => x);
    repoRefresh.create.mockImplementation((x: any) => x);
    repoRefresh.update.mockResolvedValue(undefined);

    const service = new RefreshTokenService();
    const tokens = await service.refresh(refreshToken, "ua", "127.0.0.1");

    expect(typeof tokens.tokenAccess).toBe("string");
    expect(typeof tokens.tokenRefresh).toBe("string");
    expect(repoRefresh.update).toHaveBeenCalled(); // revoga + hash tokenPlan no generateRefreshToken
  });

  it("RefreshTokenService - refresh: 401 quando tokenDb está expirado", async () => {
    const expiredRefreshTokenDb = {
      id: "rt-1",
      jti: "jti-old",
      tokenhash: "hash",
      expireIn: new Date("2000-01-01T00:00:00.000Z"),
      revoked: false,
      userAgent: "ua",
      ipAddress: "127.0.0.1",
      sessionId: "sess",
      pesquisador: { id: "p-1", email: "a@b.com" } as any,
    };

    repoRefresh.findOne.mockResolvedValue(expiredRefreshTokenDb);

    // token fake: o jwt.verify vai validar assinatura; aqui vamos gerar um token "real"
    // com jti compatível para o service passar do jwt.verify.
    const { default: jwt } = await import("jsonwebtoken");
    const jwtConfig = (await import("../../src/config/jwt.config.js")).jwtConfig;
    const refreshToken = jwt.sign({ sub: "p-1", jti: "jti-old", type: "refresh" }, jwtConfig.refresh.secret, {
      expiresIn: jwtConfig.refresh.expiresIn,
    });

    const service = new RefreshTokenService();
    await expect(service.refresh(refreshToken, "ua", "127.0.0.1")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("LogoutService - logout: 400 quando token inválido", async () => {
    const service = new LogoutService();
    await expect(service.logout("invalid.token.value")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("LogoutService - logout: revoga refresh token por jti", async () => {
    const { default: jwt } = await import("jsonwebtoken");
    const { jwtConfig } = await import("../../src/config/jwt.config.js");

    const jti = "jti-logout-1";
    const refreshToken = jwt.sign({ sub: "p-1", jti, type: "refresh" }, jwtConfig.refresh.secret, {
      expiresIn: jwtConfig.refresh.expiresIn,
    });

    const service = new LogoutService();
    await service.logout(refreshToken);

    expect(repoRefresh.update).toHaveBeenCalled();
  });

  it("LogoutService - logoutAll: revoga todos refresh tokens do usuário", async () => {
    const service = new LogoutService();
    await service.logoutAll("user-1");
    expect(repoRefresh.update).toHaveBeenCalled();
  });
});

