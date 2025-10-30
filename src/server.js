const express = require('express')
const cors = require('cors')
require('dotenv').config()

const { connectDB } = require('./config/mongodb')
const mainRouter = require('./routes/index')

const port = process.env.APP_PORT
const app = express()

app.use(cors())
app.use(express.json())

connectDB()
  .then(() => {
    app.get('/', (req, res) => {
      res.send('Chào mừng đến với Backend API!')
    })

    app.use('/api', mainRouter)

    app.listen(port, () => {
      console.log(`Máy chủ đang chạy tại http://localhost:${port}`)
    })
  })
  .catch(error => {
    console.error('Không thể khởi động máy chủ do lỗi kết nối DB:', error)
    process.exit(1)
  })