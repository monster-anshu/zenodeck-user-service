import { SESSION_JWT_SECRET } from '@/env';
import { Session } from '@/types';
import jwt from 'jsonwebtoken';

const verifyJwt = (token: string) => {
  return new Promise<Session | null>((resolve) => {
    if (!token) {
      return resolve(null);
    }
    jwt.verify(token, SESSION_JWT_SECRET, function (_err, decoded) {
      if (typeof decoded === 'object') {
        resolve(decoded?.data || null);
        return;
      }
      resolve(null);
    });
  });
};

export default verifyJwt;
