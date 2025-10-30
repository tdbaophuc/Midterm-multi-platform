const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

// /api/users/register
router.post('/register', userController.register)

// /api/users/login
router.post('/login', userController.login)

// /api/users/
router.get('/', userController.getAllUsers)

// /api/users/:id
router.put('/:id', userController.updateUser)

// /api/users/:id
router.delete('/:id', userController.deleteUser)

module.exports = router