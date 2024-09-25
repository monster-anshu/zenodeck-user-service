import { SESSION_JWT_SECRET } from '@/env';
import { Session } from '@/types';
import jwt, { SignOptions } from 'jsonwebtoken';

const signJwt = (data: Session, options: SignOptions) => {
  const { expiresIn } = options;
  return jwt.sign(
    {
      data,
    },
    SESSION_JWT_SECRET,
    { expiresIn: expiresIn || 90 * 24 * 60 * 60 },
  );
};

export default signJwt;
