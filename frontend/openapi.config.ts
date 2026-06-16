import {GeneratorConfig} from 'ng-openapi';

const config: GeneratorConfig = {
  input: './swagger-json.json',
  output: './src/client',
  options: {
    dateType: 'Date',
    enumStyle: 'enum',
  },
};

export default config;
