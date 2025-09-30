import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { InitRouters } from './routers/index.js';
import { sendData } from './utils/data.js';

const app = express();

const port = 5000;

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

InitRouters(app);

//! connect database
mongoose
  .connect('mongodb://127.0.0.1:27017/Son')
  .then(() => {
    console.log('Connect database successfully !');
    sendData();
  })
  .catch((err) => {
    console.log(err);
  });

//! start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
