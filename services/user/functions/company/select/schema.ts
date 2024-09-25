import { PRODUCT_IDS } from '@/common/const';
import { JSONSchema } from 'json-schema-to-ts';

const schema = {
  type: 'object',
  properties: {
    companyId: { type: 'string' },
    productId: { type: 'string', enum: PRODUCT_IDS },
  },
  required: ['companyId', 'productId'] as const,
} satisfies JSONSchema;

export default schema;
