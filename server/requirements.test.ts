import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: ({
      clearCookie: () => {},
    } as unknown) as TrpcContext["res"],
  };
}

describe("Requirements procedures", () => {
  const ctx = createTestContext();
  const caller = appRouter.createCaller(ctx);

  it("should list all sectors", async () => {
    const sectors = await caller.requirements.getSectors();
    
    expect(sectors).toBeDefined();
    expect(Array.isArray(sectors)).toBe(true);
    expect(sectors.length).toBeGreaterThan(0);
  });

  it("should get requirements by sector", async () => {
    // First get a sector
    const sectors = await caller.requirements.getSectors();
    expect(sectors.length).toBeGreaterThan(0);
    
    const sector = sectors[0];
    const requirements = await caller.requirements.getBySector({ sector });
    
    expect(requirements).toBeDefined();
    expect(Array.isArray(requirements)).toBe(true);
    
    if (requirements.length > 0) {
      const req = requirements[0];
      expect(req).toHaveProperty("id");
      expect(req).toHaveProperty("eixo");
      expect(req).toHaveProperty("requisito");
      expect(req).toHaveProperty("setorExecutor");
      expect(req.setorExecutor).toBe(sector);
    }
  });

  it("should update requirement status", async () => {
    // Get a requirement first
    const sectors = await caller.requirements.getSectors();
    const sector = sectors[0];
    const requirements = await caller.requirements.getBySector({ sector });
    
    if (requirements.length > 0) {
      const req = requirements[0];
      
      const result = await caller.requirements.updateStatus({
        requirementId: req.id,
        status: "em_andamento",
        linkEvidencia: "https://example.com/evidence",
        observacoes: "Teste de atualização"
      });
      
      expect(result).toEqual({ success: true });
    }
  });

  it("should calculate progress for a sector", async () => {
    const sectors = await caller.requirements.getSectors();
    const sector = sectors[0];
    
    const progress = await caller.requirements.getProgress({ sector });
    
    expect(progress).toBeDefined();
    expect(progress).toHaveProperty("totalPoints");
    expect(progress).toHaveProperty("completedPoints");
    expect(progress).toHaveProperty("percentage");
    expect(typeof progress.totalPoints).toBe("number");
    expect(typeof progress.completedPoints).toBe("number");
    expect(typeof progress.percentage).toBe("number");
    expect(progress.percentage).toBeGreaterThanOrEqual(0);
    expect(progress.percentage).toBeLessThanOrEqual(100);
  });

  it("should list all coordinators", async () => {
    const coords = await caller.requirements.getCoordinators();
    expect(coords).toBeDefined();
    expect(Array.isArray(coords)).toBe(true);
  });

  it("should get requirements by coordinator when available", async () => {
    const coords = await caller.requirements.getCoordinators();
    const coordsFiltered = coords.filter(c => !!c);
    if (coordsFiltered.length > 0) {
      const coord = coordsFiltered[0] as string;
      const reqs = await caller.requirements.getByCoordinator({ coordinator: coord });
      expect(reqs).toBeDefined();
      expect(Array.isArray(reqs)).toBe(true);
      if (reqs.length > 0) {
        expect(reqs[0]).toHaveProperty("coordenadorExecutivo");
        expect(reqs[0].coordenadorExecutivo).toBe(coord);
      }
    }
  });
});
