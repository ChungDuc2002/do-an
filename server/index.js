import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { InitRouters } from './routers/index.js';
import { sendData } from './utils/data.js';
import { initializeSocket } from './socket/socketHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const port = 5000;

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

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

//! Initialize Socket.IO
initializeSocket(io);

//! start server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Socket.IO server is ready`);
});
