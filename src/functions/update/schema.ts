import type { JSONSchema } from "json-schema-to-ts";

const schema = {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" },
  },
  required: ["firstName", "lastName"] as const,
} satisfies JSONSchema;

export default schema;
