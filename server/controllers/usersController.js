import users from '../models/users.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// Logic Reset Password ---------------------------------
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const oldUser = await users.findOne({ email });
    if (!oldUser) {
      return res.status(404).json({ message: 'User Not Exists!' });
    }
    const secret = process.env.JWT_ACCESS_KEY + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: '30m',
    });

    const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nguyenchungduc2002@gmail.com',
        pass: 'vphkbllyoiythqod',
      },
    });

    var mailOptions = {
      from: 'youremail@gmail.com',
      to: email,
      subject: 'Password Reset',
      priority: 'high',
      html: `
      <h1 style="opacity:0.8 ; color: orange;font-family: 'Poppins', sans-serif; font-weight: 500; ">Welcome to Tromoi.com</h1>
      <h2 style="color:#333 ;font-family: 'Poppins', sans-serif; font-weight: 500;">Được biết bạn có yêu cầu khôi phục lại mật khẩu đã bị mất . Chúng tôi đã gửi cho bạn một liên kết ở phía dưới ...</h2>
      <h3 style="font-family: 'Poppins', sans-serif; font-weight: 500;">Vui lòng Click <a href="${link}">vào đây</a> để khôi phục lại mật khẩu.</h3>
      <h4 style="font-family: 'Poppins', sans-serif; font-weight: 500;">Lưu ý : Link khôi phục chỉ tồn tại trong vòng 3p .</h4>
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0h9CGRHNCU421t_qoLQuvyrduVBCOqap42A&s" alt="Image"/>
      <p style="font-size:15px ;font-family: 'Poppins', sans-serif; font-weight: 500;">Cảm ơn bạn vì đã tin tưởng sử dụng dịch vụ của chúng tôi . Thank !</p>
      `,
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent :' + info.response);
      }
    });
    console.log(link);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function resetPassword(req, res) {
  const { id, token } = req.params;
  console.log(req.params);
  const oldUser = await users.findOne({ _id: id });
  console.log(oldUser);

  if (!oldUser) {
    return res.status(404).json('User Not Exits');
  }
  const secret = process.env.JWT_ACCESS_KEY + oldUser.password;
  console.log(secret);

  try {
    const verify = jwt.verify(token, secret);
    return res.render('index', { email: verify.email, status: 'Not Verified' });
  } catch (error) {
    console.error('JWT verify error:', error);
    return res.status(500).json('Not Verified');
  }
}

export async function postResetPassword(req, res) {
  const { id, token } = req.params;
  const { password } = req.body;
  const oldUser = await users.findOne({ _id: id });
  if (!oldUser) {
    return res.status(404).json('User Not Exits');
  }
  const secret = process.env.JWT_ACCESS_KEY + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await users.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );
    return res.render('index', { email: verify.email, status: 'Verified' });
  } catch (error) {
    return res.status(500).json('Something Went Wrong');
  }
}
// ------------------------------
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
