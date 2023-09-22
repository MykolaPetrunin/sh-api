import { Options } from 'swagger-jsdoc';

const { APP_URL } = process.env;

if (!APP_URL) {
  throw new Error('Application url configuration variable is missing');
}

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'A simple Express API',
    },
    servers: [
      {
        url: APP_URL,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        recipe: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
              required: false,
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts'],
};

export default swaggerOptions;
