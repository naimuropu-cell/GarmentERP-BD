import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';
import { store } from '../services/store';
import { SystemRoleCode, UserPayload } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access denied. Bearer authorization token is missing or invalid.'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid or expired access token.',
        details: err.message
      }
    });
  }
};

export const requirePermission = (requiredPermission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
    }

    // Super Admin has universal access
    if (req.user.roleCode === 'SUPER_ADMIN') {
      return next();
    }

    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: `Forbidden. You lack the required permission: [${requiredPermission}]. Contact your System Admin.`,
          requiredPermission,
          userRole: req.user.roleCode
        }
      });
    }

    next();
  };
};

export const requireRole = (allowedRoles: SystemRoleCode[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
    }

    if (req.user.roleCode === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.roleCode)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ROLE_NOT_AUTHORIZED',
          message: `Access denied. Role ${req.user.roleCode} is not authorized for this operation.`,
          allowedRoles
        }
      });
    }

    next();
  };
};
