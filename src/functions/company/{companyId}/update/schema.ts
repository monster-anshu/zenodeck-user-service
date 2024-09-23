import { JSONSchema } from "json-schema-to-ts";

const schema = {
  type: "object",
  properties: {
    companyName: { type: "string" },
    companyLogo: { type: "string" },
  },
  required: ["companyName"] as const,
} satisfies JSONSchema;

export default schema;
