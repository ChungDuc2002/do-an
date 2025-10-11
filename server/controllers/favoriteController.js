import Favorite from '../models/favorite.js';

export async function addToFavorite(req, res) {
  try {
    const { userId, roomId } = req.body;

    // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
    const existingFavorite = await Favorite.findOne({ userId, roomId });
    if (existingFavorite) {
      return res
        .status(400)
        .json({ message: 'Sản phẩm đã có trong danh sách yêu thích' });
    }

    const newFavorite = new Favorite({ userId, roomId });
    await newFavorite.save();

    return res.status(201).json({
      message: 'Sản phẩm đã được thêm vào danh sách yêu thích',
      favorite: newFavorite,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function removeFavorite(req, res) {
  try {
    const { userId, roomId } = req.params;

    // Thêm await và kiểm tra kết quả xóa
    const result = await Favorite.findOneAndDelete({
      userId: userId,
      roomId: roomId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng trong danh sách yêu thích',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sản phẩm đã được xóa khỏi danh sách yêu thích',
      deletedItem: result,
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getFavorites(req, res) {
  try {
    const { userId } = req.params;

    const favorites = await Favorite.find({ userId }).populate('roomId');

    return res.status(200).json(favorites);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Kiểm tra xem phòng có trong yêu thích không
export async function checkFavorite(req, res) {
  try {
    const { userId, roomId } = req.query;

    const existingFavorite = await Favorite.findOne({ userId, roomId });

    return res.status(200).json({
      isFavorite: !!existingFavorite,
      favorite: existingFavorite,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      isFavorite: false,
    });
  }
}

// Xóa khỏi yêu thích bằng body
export async function removeFromFavorite(req, res) {
  try {
    const { userId, roomId } = req.body;

    const result = await Favorite.findOneAndDelete({
      userId: userId,
      roomId: roomId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng trong danh sách yêu thích',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Phòng đã được xóa khỏi danh sách yêu thích',
      deletedItem: result,
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
