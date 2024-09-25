import { PRODUCT_IDS } from '@/common/const';
import { JSONSchema } from 'json-schema-to-ts';

const schema = {
  type: 'object',
  properties: {
    productId: { type: 'string', enum: PRODUCT_IDS },
  },
  required: ['productId'] as const,
} satisfies JSONSchema;

export default schema;
