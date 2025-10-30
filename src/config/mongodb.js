const { MongoClient, ServerApiVersion } = require('mongodb')
require('dotenv').config()

const uri = process.env.MONGODB_URI
const dbName = process.env.DATABASE_NAME

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

let db

const connectDB = async () => {
  try {
    await client.connect()
    db = client.db(dbName)
    await client.db('admin').command({ ping: 1 })
    console.log(`Đã kết nối thành công tới MongoDB! (Database: ${dbName})`)
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error)
    process.exit(1)
  }
}

const getDb = () => {
  if (!db) {
    throw new Error('Database chưa được khởi tạo')
  }
  return db
}

module.exports = { connectDB, getDb }