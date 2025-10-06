import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { InitRouters } from './routers/index.js';
import { sendData } from './utils/data.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = 5000;

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

//! lấy lại mật khẩu cho email
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
