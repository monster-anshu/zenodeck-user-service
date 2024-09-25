import { PRODUCT_IDS } from '@/common/const';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';

const schema = {
  type: 'object',
  properties: {
    emailId: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    productId: { type: 'string', enum: PRODUCT_IDS },
  },
  required: ['emailId', 'password'] as const,
} satisfies JSONSchema;

export default schema;
export type LoginSchema = FromSchema<typeof schema>;
