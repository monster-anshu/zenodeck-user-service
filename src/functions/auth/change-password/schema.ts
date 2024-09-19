import type { JSONSchema } from "json-schema-to-ts";

const schema = {
  type: "object",
  properties: {
    password: { type: "string", minLength: 8 },
  },
  required: ["password"] as const,
} satisfies JSONSchema;

export default schema;
