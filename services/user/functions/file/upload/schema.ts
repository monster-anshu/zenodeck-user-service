export default {
  type: 'object',
  properties: {
    mimeType: { type: 'string' },
    module: { type: 'string' },
    fileName: { type: 'string' },
  },
  required: ['mimeType'],
} as const;
