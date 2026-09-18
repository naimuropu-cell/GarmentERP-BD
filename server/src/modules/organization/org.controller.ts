import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../middleware/auth';
import { store } from '../../services/store';

const createFactorySchema = z.object({
  name: z.string().min(3, 'Factory name is required'),
  code: z.string().min(2, 'Factory code is required'),
  division: z.string().default('Dhaka'),
  district: z.string().default('Gazipur'),
  upazila: z.string().optional().default(''),
  address: z.string().min(5, 'Physical factory address is required')
});

const createLineSchema = z.object({
  departmentId: z.string(),
  lineNumber: z.string().min(1, 'Line number/identifier is required'),
  operatorCapacity: z.number().int().positive().default(40),
  helperCapacity: z.number().int().nonnegative().default(10),
  targetEfficiency: z.number().positive().max(100).default(85.0)
});

export class OrganizationController {
  // Complete Hierarchy Tree
  public static async getHierarchy(req: Request, res: Response) {
    const company = store.getCompany();
    return res.status(200).json({
      success: true,
      data: company
    });
  }

  // Get All Factories
  public static async getFactories(req: Request, res: Response) {
    const factories = store.getFactories();
    return res.status(200).json({
      success: true,
      data: factories.map(f => {
        let lineCount = 0;
        f.buildings.forEach(b => {
          b.floors.forEach(fl => {
            fl.departments.forEach(d => {
              lineCount += d.lines.length;
            });
          });
        });

        return {
          id: f.id,
          name: f.name,
          code: f.code,
          division: f.division,
          district: f.district,
          upazila: f.upazila,
          address: f.address,
          isActive: f.isActive,
          buildingCount: f.buildings.length,
          warehouseCount: f.warehouses.length,
          totalProductionLines: lineCount
        };
      })
    });
  }

  // Get Single Factory Detail
  public static async getFactoryById(req: Request, res: Response) {
    const { id } = req.params;
    const factory = store.getFactoryById(id);
    if (!factory) {
      return res.status(404).json({
        success: false,
        error: { code: 'FACTORY_NOT_FOUND', message: `Factory with id [${id}] not found.` }
      });
    }

    return res.status(200).json({
      success: true,
      data: factory
    });
  }

  // Create Factory
  public static async createFactory(req: AuthenticatedRequest, res: Response) {
    const validation = createFactorySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'Invalid factory parameters', details: validation.error.format() }
      });
    }

    const newFactory = store.addFactory({
      ...validation.data,
      companyId: store.getCompany().id,
      isActive: true
    });

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || null,
      userEmail: req.user?.email,
      userName: req.user?.fullName,
      action: 'CREATE',
      entityName: 'Factory',
      entityId: newFactory.id,
      newValues: { name: newFactory.name, code: newFactory.code, division: newFactory.division },
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: `Factory [${newFactory.name}] registered successfully.`,
      data: newFactory
    });
  }

  // Create Production Line
  public static async createProductionLine(req: AuthenticatedRequest, res: Response) {
    const validation = createLineSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'Invalid line parameters', details: validation.error.format() }
      });
    }

    const { departmentId, ...lineData } = validation.data;
    const newLine = store.addProductionLine(departmentId, {
      departmentId,
      ...lineData,
      isActive: true
    });

    if (!newLine) {
      return res.status(404).json({
        success: false,
        error: { code: 'DEPARTMENT_NOT_FOUND', message: `Department with id [${departmentId}] not found.` }
      });
    }

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || null,
      userEmail: req.user?.email,
      userName: req.user?.fullName,
      action: 'CREATE',
      entityName: 'ProductionLine',
      entityId: newLine.id,
      newValues: { lineNumber: newLine.lineNumber, departmentId },
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: `Production line [${newLine.lineNumber}] created successfully.`,
      data: newLine
    });
  }

  // Warehouses List
  public static async getWarehouses(req: Request, res: Response) {
    const factories = store.getFactories();
    const warehouses = factories.flatMap(f => f.warehouses.map(w => ({ ...w, factoryName: f.name })));
    return res.status(200).json({
      success: true,
      data: warehouses
    });
  }
}
