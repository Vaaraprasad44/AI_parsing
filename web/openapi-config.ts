import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: '../PythonApi/openapi.json',
  apiFile: './src/store/api/empty-api.ts',
  apiImport: 'emptySplitApi',
  outputFiles: {
    './src/store/api/generated/personal-info.ts': {
      // No filter - include all endpoints
    },
  },
  exportName: 'personalInfoApi',
  hooks: true,
}

export default config