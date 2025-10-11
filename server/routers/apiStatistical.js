import express from 'express';
import {
  getOverallStatistics,
  getUserStatistics,
  getRoomStatistics,
  getRevenueStatistics,
} from '../controllers/statisticalController.js';

const router = express.Router();

// Route lấy thống kê tổng quan
router.get('/overview', getOverallStatistics);

// Route lấy thống kê người dùng
router.get('/users', getUserStatistics);

// Route lấy thống kê phòng
router.get('/rooms', getRoomStatistics);

// Route lấy thống kê doanh thu
router.get('/revenue', getRevenueStatistics);

export default router;
