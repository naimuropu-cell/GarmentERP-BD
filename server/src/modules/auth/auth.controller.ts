import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ACCESS_TOKEN_EXPIRY, JWT_REFRESH_SECRET, JWT_SECRET, REFRESH_TOKEN_EXPIRY } from '../../config/constants';
import { AuthenticatedRequest } from '../../middleware/auth';
import { store } from '../../services/store';
import { SystemRoleCode, UserPayload } from '../../types';

// Validation Schemas
export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  roleCode: z.string().default('MERCHANDISER'),
  factoryIds: z.array(z.string()).optional()
});

export const updateUserRoleSchema = z.object({
  roleCode: z.string(),
  factoryIds: z.array(z.string()).optional()
});

export class AuthController {
  // Login
  public static async login(req: Request, res: Response) {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid login parameters',
            details: validation.error.format()
          }
        });
      }

      const { email, password } = validation.data;
      const user = store.findUserByEmail(email);

      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email address or password provided.'
          }
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_DEACTIVATED',
            message: 'Your account has been deactivated. Contact your Factory Administrator.'
          }
        });
      }

      const role = store.getRoleByCode(user.roleCode);
      const permissions = role ? role.permissions : [];

      const tokenPayload: UserPayload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roleCode: user.roleCode,
        permissions,
        factoryIds: user.factoryIds
      };

      const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
      const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

      store.setRefreshToken(user.id, refreshToken);
      user.lastLoginAt = new Date().toISOString();

      // Log audit
      store.addAuditLog({
        id: `audit-${Date.now()}`,
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        action: 'LOGIN',
        entityName: 'UserSession',
        entityId: user.id,
        ipAddress: req.ip || req.socket.remoteAddress,
        timestamp: new Date().toISOString()
      });

      const factories = store.getFactories()
        .filter(f => user.factoryIds.includes(f.id))
        .map(f => ({ id: f.id, name: f.name, code: f.code, division: f.division }));

      return res.status(200).json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: {
              code: user.roleCode,
              name: role?.name || user.roleCode,
              description: role?.description || '',
              permissions
            },
            factories,
            lastLoginAt: user.lastLoginAt
          }
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  // Register
  public static async register(req: Request, res: Response) {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid registration parameters',
            details: validation.error.format()
          }
        });
      }

      const { email, password, fullName, phone, roleCode, factoryIds } = validation.data;
      const existingUser = store.findUserByEmail(email);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'USER_ALREADY_EXISTS',
            message: `User with email [${email}] is already registered.`
          }
        });
      }

      const defaultFactoryIds = factoryIds && factoryIds.length > 0
        ? factoryIds
        : [store.getFactories()[0].id];

      const salt = bcrypt.genSaltSync(10);
      const newUser = store.createUser({
        email,
        passwordHash: bcrypt.hashSync(password, salt),
        fullName,
        phone: phone || '',
        roleCode: roleCode as SystemRoleCode,
        factoryIds: defaultFactoryIds,
        isActive: true
      });

      store.addAuditLog({
        id: `audit-${Date.now()}`,
        userId: newUser.id,
        userEmail: newUser.email,
        userName: newUser.fullName,
        action: 'CREATE',
        entityName: 'UserAccount',
        entityId: newUser.id,
        newValues: { roleCode: newUser.roleCode, factoryIds: newUser.factoryIds },
        timestamp: new Date().toISOString()
      });

      return res.status(201).json({
        success: true,
        message: 'User account created successfully.',
        data: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          roleCode: newUser.roleCode
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  // Refresh Token
  public static async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Refresh token is required.' }
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
      const storedToken = store.getRefreshToken(decoded.id);

      if (storedToken !== refreshToken) {
        return res.status(403).json({
          success: false,
          error: { code: 'TOKEN_REVOKED', message: 'Refresh token has been revoked or expired.' }
        });
      }

      const user = store.findUserById(decoded.id);
      if (!user || !user.isActive) {
        return res.status(403).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User associated with token no longer active.' }
        });
      }

      const role = store.getRoleByCode(user.roleCode);
      const tokenPayload: UserPayload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roleCode: user.roleCode,
        permissions: role ? role.permissions : [],
        factoryIds: user.factoryIds
      };

      const newAccessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

      return res.status(200).json({
        success: true,
        data: { accessToken: newAccessToken }
      });
    } catch (err: any) {
      return res.status(403).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token verification failed.', details: err.message }
      });
    }
  }

  // Current Authenticated User (Me)
  public static async getMe(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in' } });
    }

    const user = store.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    const role = store.getRoleByCode(user.roleCode);
    const factories = store.getFactories()
      .filter(f => user.factoryIds.includes(f.id))
      .map(f => ({ id: f.id, name: f.name, code: f.code, division: f.division }));

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: {
          code: user.roleCode,
          name: role?.name || user.roleCode,
          description: role?.description || '',
          permissions: role?.permissions || []
        },
        factories,
        lastLoginAt: user.lastLoginAt
      }
    });
  }

  // List Roles
  public static async getRoles(req: Request, res: Response) {
    const roles = store.getAllRoles();
    return res.status(200).json({
      success: true,
      data: roles
    });
  }

  // List Users
  public static async getUsers(req: AuthenticatedRequest, res: Response) {
    const users = store.getAllUsers();
    return res.status(200).json({
      success: true,
      data: users
    });
  }

  // Update User Role
  public static async updateUserRole(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const validation = updateUserRoleSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'Invalid payload', details: validation.error.format() }
      });
    }

    const { roleCode, factoryIds } = validation.data;
    const validRole = store.getRoleByCode(roleCode as SystemRoleCode);

    if (!validRole) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: `Role code [${roleCode}] does not exist.` }
      });
    }

    const updatedUser = store.updateUserRole(id, roleCode as SystemRoleCode, factoryIds);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `User with id [${id}] not found.` }
      });
    }

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || null,
      userEmail: req.user?.email,
      userName: req.user?.fullName,
      action: 'UPDATE',
      entityName: 'UserRoleAssignment',
      entityId: id,
      newValues: { updatedRole: roleCode, factoryIds },
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `User role successfully updated to ${validRole.name}.`,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        roleCode: updatedUser.roleCode,
        factoryIds: updatedUser.factoryIds
      }
    });
  }
}
