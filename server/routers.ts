import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  requirements: router({
    getSectors: publicProcedure.query(async () => {
      const { getAllSectors } = await import("./db");
      return await getAllSectors();
    }),
    getCoordinators: publicProcedure.query(async () => {
      const { getAllCoordinators } = await import("./db");
      return await getAllCoordinators();
    }),
    
    getBySector: publicProcedure
      .input(z.object({ sector: z.string() }))
      .query(async ({ input }) => {
        const { getRequirementsBySector } = await import("./db");
        const reqs = await getRequirementsBySector(input.sector);
        
        // Get updates for all requirements
        const { getDb } = await import("./db");
        const { requirementUpdates } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        
        if (!db) return reqs.map(r => ({ ...r, update: null }));
        
        const reqIds = reqs.map(r => r.id);
        const updates = await db.select().from(requirementUpdates)
          .where(eq(requirementUpdates.requirementId, reqIds[0]));
        
        // Create a map of updates
        const updateMap = new Map();
        for (const reqId of reqIds) {
          const reqUpdates = await db.select().from(requirementUpdates)
            .where(eq(requirementUpdates.requirementId, reqId))
            .orderBy(requirementUpdates.updatedAt)
            .limit(1);
          if (reqUpdates.length > 0) {
            updateMap.set(reqId, reqUpdates[0]);
          }
        }
        
        return reqs.map(r => ({
          ...r,
          update: updateMap.get(r.id) || null
        }));
      }),
    getByCoordinator: publicProcedure
      .input(z.object({ coordinator: z.string() }))
      .query(async ({ input }) => {
        const { getRequirementsByCoordinator, getDb } = await import("./db");
        const { requirementUpdates } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const reqs = await getRequirementsByCoordinator(input.coordinator);
        const db = await getDb();

        if (!db) return reqs.map(r => ({ ...r, update: null }));

        const updateMap = new Map<number, any>();
        for (const req of reqs) {
          const reqUpdates = await db.select().from(requirementUpdates)
            .where(eq(requirementUpdates.requirementId, req.id))
            .orderBy(requirementUpdates.updatedAt)
            .limit(1);
          if (reqUpdates.length > 0) updateMap.set(req.id, reqUpdates[0]);
        }

        return reqs.map(r => ({
          ...r,
          update: updateMap.get(r.id) || null
        }));
      }),
    
    updateStatus: publicProcedure
      .input(z.object({
        requirementId: z.number(),
        status: z.enum(["pendente", "em_andamento", "concluido"]),
        linkEvidencia: z.string().optional(),
        observacoes: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        const { upsertRequirementUpdate } = await import("./db");
        await upsertRequirementUpdate(input);
        return { success: true };
      }),
    
    getProgress: publicProcedure
      .input(z.object({ sector: z.string() }))
      .query(async ({ input }) => {
        const { getRequirementsBySector, getDb } = await import("./db");
        const { requirementUpdates } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        const reqs = await getRequirementsBySector(input.sector);
        const db = await getDb();
        
        if (!db) return { totalPoints: 0, completedPoints: 0, percentage: 0 };
        
        let totalPoints = 0;
        let completedPoints = 0;
        
        for (const req of reqs) {
          totalPoints += req.pontosAplicaveis2026 || 0;
          
          const updates = await db.select().from(requirementUpdates)
            .where(eq(requirementUpdates.requirementId, req.id))
            .limit(1);
          
          if (updates.length > 0 && updates[0].status === "concluido") {
            completedPoints += req.pontosAplicaveis2026 || 0;
          }
        }
        
        const percentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;
        
        return { totalPoints, completedPoints, percentage };
      }),
  }),
});

export type AppRouter = typeof appRouter;
