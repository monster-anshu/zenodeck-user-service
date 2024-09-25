import { PRODUCT_IDS } from '@/common/const';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    companyName: { type: 'string' },
    emailId: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    countryCode: { type: 'string' },
    mobileNo: { type: 'string' },
    productId: { type: 'string', enum: PRODUCT_IDS },
  },
  required: [
    'firstName',
    'lastName',
    'emailId',
    'countryCode',
    'mobileNo',
    'password',
  ] as const,
} satisfies JSONSchema;

export default schema;
export type RegisterSchema = FromSchema<typeof schema>;
