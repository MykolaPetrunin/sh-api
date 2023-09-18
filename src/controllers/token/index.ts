import express from 'express';
import revoke from './revoke';

const router = express.Router();

router.use('/revoke', revoke);

export default router;
