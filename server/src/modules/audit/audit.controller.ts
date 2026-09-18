import { Request, Response } from 'express';
import { store } from '../../services/store';

export class AuditController {
  public static async getLogs(req: Request, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const entity = req.query.entity as string | undefined;
    const action = req.query.action as string | undefined;

    let logs = store.getAuditLogs(limit);

    if (entity) {
      logs = logs.filter(l => l.entityName.toLowerCase() === entity.toLowerCase());
    }

    if (action) {
      logs = logs.filter(l => l.action.toLowerCase() === action.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      data: {
        total: logs.length,
        logs
      }
    });
  }
}
