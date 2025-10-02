import users from '../models/users.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function info(req, res) {
  try {
    const user = await users.findById(req.user.id);
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const allUsers = await users.find();
    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await users.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function createUser(req, res) {
  try {
    // Kiểm tra email đã tồn tại
    const existingUser = await users.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Kiểm tra số điện thoại đã tồn tại
    const existingPhone = await users.findOne({ phone: req.body.phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Tạo user mới
    const newUser = await users.create({
      fullName: req.body.fullName,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      avatar: req.body.avatar || 'default-avatar.png',
      isAdmin: req.body.isAdmin || false,
      rentalHistory: [],
      currentRoom: null,
    });

    // Loại bỏ password trước khi trả về
    const { password, ...others } = newUser._doc;

    return res.status(201).json({
      message: 'Tạo tài khoản thành công',
      user: others,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      message: 'Lỗi tạo tài khoản',
      error: error.message,
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await users.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateUser(req, res) {
  // try {
  //   const { id } = req.params;
  //   const updatedData = req.body;
  //   if (updatedData.password) {
  //     const salt = await bcrypt.genSalt(10);
  //     updatedData.password = await bcrypt.hash(updatedData.password, salt);
  //   }
  //   const updatedUser = await users.findByIdAndUpdate(id, updatedData, {
  //     new: true,
  //   });
  //   if (!updatedUser) {
  //     return res.status(404).json({ message: 'User not found' });
  //   }
  //   const { password, ...others } = updatedUser._doc;
  //   return res.status(200).json(others);
  // } catch (error) {
  //   return res.status(500).json({ message: error.message });
  // }
  try {
    const id = req.params.id;
    const result = await users.findByIdAndUpdate(
      id,
      {
        //* đặt các trường và giá trị mới cho bản ghi người dùng dựa trên req.body
        $set: req.body,
      },
      //* trả về bản ghi mới sau khi cập nhật
      { new: true }
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function searchUserByName(req, res) {
  try {
    const nameUser = await users.find({
      fullName: { $regex: req.query.fullName, $options: 'i' },
    });
    return res.status(200).json(nameUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// !------------------------------------ JWT

function generateAccessToken(user) {
  //* Create access Token
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_ACCESS_KEY,
    {
      expiresIn: '365d',
    }
  );
}

function generateRefreshToken(user) {
  //* Create refresh Token
  return jwt.sign(
    {
      id: user.id,
      fullName: user.fullName,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_REFRESH_KEY,
    {
      expiresIn: '365d',
    }
  );
}

export async function Login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    if (user && validPassword) {
      //* Create token
      const accessToken = generateAccessToken(user);

      //* Create refresh token
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'strict',
      });

      const { password, ...other } = user._doc;
      return res.status(200).json({ ...other, accessToken });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function Register(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    // Kiểm tra số điện thoại đã tồn tại
    const existingPhone = await users.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
    }
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Tạo user mới
    const newUser = await users.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      avatar: 'default-avatar.png',
      isAdmin: false,
      rentalHistory: [],
      currentRoom: null,
    });
    // Loại bỏ password trước khi trả về
    const { password: pwd, ...others } = newUser._doc;
    return res.status(201).json({
      message: 'Tạo tài khoản thành công',
      user: others,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      message: 'Lỗi tạo tài khoản',
      error: error.message,
    });
  }
}
