import express from 'express';
import cors from 'cors';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config';
import { sequelize } from './config/sequelize';
import swaggerOptions from './config/swaggerOptions';
import { logger } from './config/logger';
import userRoutes from './routes/userRoutes';
import tokenRoutes from './routes/tokenRoutes';
import productRoutes from './routes/productRoutes';
import recipeRoutes from './routes/recipeRoutes';
import './models/associations';

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 204,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));

app.use(express.json());

sequelize
  .sync()
  .then(() => {
    logger.info('DB Synced'); // Використовуємо логгер замість console.log

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    app.use('/api/users', userRoutes);

    app.use('/api/token', tokenRoutes);

    app.use('/api/products', productRoutes);

    app.use('/api/recipes', recipeRoutes);

    app.listen(port, () => {
      logger.info(`Server running on http://localhost:${port}/`); // Використовуємо логгер замість console.log
    });
  })
  .catch((error) => {
    logger.error(`Error syncing database: ${error}`); // Використовуємо логгер замість console.error
  });
