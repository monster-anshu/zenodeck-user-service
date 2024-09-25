import type { JSONSchema } from 'json-schema-to-ts';

const schema = {
  type: 'object',
  properties: {
    emailId: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
  },
  required: ['password', 'emailId'] as const,
} satisfies JSONSchema;

export default schema;
