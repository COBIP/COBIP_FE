export type TokenRole = 'USER' | 'ADMIN';

type JwtPayload = {
  exp?: number;
  role?: string;
  roles?: string[] | string;
  authority?: string;
  authorities?: string[] | string | Array<{ authority?: string; role?: string }>;
  userRole?: string;
};

function parseBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');

  return atob(padded);
}

export function parseAccessTokenPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    return JSON.parse(parseBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

function mapTokenRole(value: unknown): TokenRole | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.toUpperCase();

  if (normalized === 'ADMIN' || normalized === 'ROLE_ADMIN') {
    return 'ADMIN';
  }

  if (normalized === 'USER' || normalized === 'ROLE_USER') {
    return 'USER';
  }

  return null;
}

function findRoleFromList(values: JwtPayload['authorities'] | JwtPayload['roles']) {
  if (typeof values === 'string') {
    return mapTokenRole(values);
  }

  if (!Array.isArray(values)) {
    return null;
  }

  for (const value of values) {
    const role =
      typeof value === 'string' ? mapTokenRole(value) : mapTokenRole(value.authority ?? value.role);

    if (role) {
      return role;
    }
  }

  return null;
}

export function getRoleFromAccessToken(token: string): TokenRole | null {
  const payload = parseAccessTokenPayload(token);

  if (!payload) {
    return null;
  }

  return (
    mapTokenRole(payload.role) ??
    mapTokenRole(payload.userRole) ??
    mapTokenRole(payload.authority) ??
    findRoleFromList(payload.authorities) ??
    findRoleFromList(payload.roles)
  );
}

export function checkAccessTokenExpired(token: string) {
  const payload = parseAccessTokenPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}
