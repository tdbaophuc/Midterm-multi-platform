const { getDb } = require('../config/mongodb')
const { ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const jwtSecret = process.env.JWT_SECRET

const getUsersCollection = () => {
  return getDb().collection('users')
}

const register = async (req, res) => {
  try {
    const { username, email, password, image } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp username, email, và password.' })
    }

    const existingUser = await getUsersCollection().findOne({ email: email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại.' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = {
      username: username,
      email: email,
      password: hashedPassword,
      image: image || null
    }

    const result = await getUsersCollection().insertOne(newUser)
    res.status(201).json({ message: 'Tạo người dùng thành công', userId: result.insertedId })
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error)
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query
    let query = {}

    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await getUsersCollection().find(query).project({ password: 0 }).toArray()
    res.status(200).json(users)
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error)
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await getUsersCollection().findOne({ email: email })
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      jwtSecret,
      { expiresIn: '1h' }
    )

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token: token,
      user: { _id: user._id, username: user.username, email: user.email, image: user.image }
    })
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error)
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, image, newPassword } = req.body
    const updateData = { username, email, image }

    // Nếu admin muốn thay đổi mật khẩu của user
    if (newPassword) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)
      updateData.password = hashedPassword
    }

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

    const result = await getUsersCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' })
    }
    res.status(200).json({ message: 'Cập nhật người dùng thành công.' })
  } catch (error) {
    console.error('Lỗi khi cập nhật người dùng:', error)
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const result = await getUsersCollection().deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' })
    }
    res.status(200).json({ message: 'Xóa người dùng thành công.' })
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error)
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' })
  }
}

module.exports = {
  register,
  getAllUsers,
  login,
  updateUser,
  deleteUser
}