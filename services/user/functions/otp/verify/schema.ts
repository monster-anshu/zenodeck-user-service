import type { JSONSchema } from 'json-schema-to-ts';

const schema = {
  type: 'object',
  properties: {
    otp: { type: 'string' },
  },
  required: ['otp'] as const,
} satisfies JSONSchema;

export default schema;
