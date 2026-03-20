import { describe, expect, it, vi } from "vitest";

import AuthController from "../../src/controllers/AuthController.js";
import AreaController from "../../src/controllers/AreaController.js";
import LeituraController from "../../src/controllers/LeituraController.js";
import PesquisadorController from "../../src/controllers/PesquisadorController.js";
import SensorController from "../../src/controllers/SensorController.js";

function mockRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

describe("Controllers", () => {
  it("PesquisadorController - create/findAll/delete", async () => {
    const svc: any = {
      create: vi.fn().mockResolvedValue({ id: "p1" }),
      findAll: vi.fn().mockResolvedValue([{ id: "p1" }]),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const c = new PesquisadorController(svc);
    const res = mockRes();

    await c.create({ body: { nome: "x" } } as any, res);
    expect(res.status).toHaveBeenCalledWith(201);

    await c.findAll({} as any, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await c.delete({ params: { id: "p1" } } as any, res);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it("AreaController - create/findById/update/sensoresAtivos/getLeituras/delete", async () => {
    const svc: any = {
      create: vi.fn().mockResolvedValue({ id: "a1" }),
      findById: vi.fn().mockResolvedValue({ id: "a1" }),
      update: vi.fn().mockResolvedValue({ id: "a1", nome: "novo" }),
      contarSensorPorArea: vi.fn().mockResolvedValue({ total: 1, ativos: 1, inativos: 0 }),
      findLeiturasByArea: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn().mockResolvedValue([]),
    };
    const c = new AreaController(svc);
    const res = mockRes();

    await c.create({ body: { nome: "Area" } } as any, res);
    await c.findById({ params: { id: "a1" } } as any, res);
    await c.update({ params: { id: "a1" }, body: { nome: "novo" } } as any, res);
    await c.sensoresAtivos({ params: { id: "a1" } } as any, res);
    await c.getLeituras({ params: { id: "a1" } } as any, res);
    await c.findAll({} as any, res);
    await c.delete({ params: { id: "a1" } } as any, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it("SensorController - getAll/add/update/delete", async () => {
    const svc: any = {
      getAllSensors: vi.fn().mockResolvedValue([]),
      addSensor: vi.fn().mockResolvedValue({ id: "s1" }),
      updateSensor: vi.fn().mockResolvedValue({ id: "s1" }),
      deleteSensor: vi.fn().mockResolvedValue(undefined),
    };
    const c = new SensorController(svc);
    const res = mockRes();
    await c.getAllSensors({} as any, res);
    await c.addSensor({ body: { serialNumber: "x" } } as any, res);
    await c.updateSensor({ params: { id: "s1" }, body: { status: "Ativo" } } as any, res);
    await c.deleteSensor({ params: { id: "s1" } } as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it("LeituraController - find/create/update/delete/listarPorArea", async () => {
    const svc: any = {
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue({ id: "l1" }),
      create: vi.fn().mockResolvedValue({ id: "l1" }),
      update: vi.fn().mockResolvedValue({ id: "l1" }),
      delete: vi.fn().mockResolvedValue(undefined),
      listarLeiturasPorArea: vi.fn().mockResolvedValue({ labels: [], temperatura: [], umidade: [] }),
    };
    const c = new LeituraController(svc);
    const res = mockRes();
    await c.findAll({} as any, res);
    await c.findById({ params: { id: "l1" } } as any, res);
    await c.create({ body: { umidade: 1 } } as any, res);
    await c.update({ params: { id: "l1" }, body: { umidade: 2 } } as any, res);
    await c.listarLeiturasPorArea({ params: { areaId: "a1" }, query: {} } as any, res);
    await c.delete({ params: { id: "l1" } } as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it("AuthController - login/refresh/logout", async () => {
    const authSvc: any = { login: vi.fn().mockResolvedValue({ tokenAccess: "a", tokenRefresh: "b" }) };
    const logoutSvc: any = { logout: vi.fn().mockResolvedValue(undefined) };
    const refreshSvc: any = { refresh: vi.fn().mockResolvedValue({ tokenAccess: "c", tokenRefresh: "d" }) };
    const c = new AuthController(authSvc, logoutSvc, refreshSvc);
    const res = mockRes();

    await c.login({ body: { email: "a", senha: "b" }, headers: { "user-agent": "ua" }, ip: "127.0.0.1" } as any, res);
    await c.refreshToken({ body: { refreshToken: "rt" }, headers: { "user-agent": "ua" }, ip: "127.0.0.1" } as any, res);
    await c.logout({ body: { refreshToken: "rt" } } as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(authSvc.login).toHaveBeenCalled();
    expect(refreshSvc.refresh).toHaveBeenCalled();
    expect(logoutSvc.logout).toHaveBeenCalled();
  });
});

