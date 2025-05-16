const express = require('express');
const jwt_Middle = require('../middleware/jwtMiddle')

const router = express.Router()

const { createUser, getUsers, updateUserRole, deleteUser} = require('../controller/userController')

router.post('/', jwt_Middle, createUser);
router.get('/',jwt_Middle,getUsers);
router.put('/:id', jwt_Middle, updateUserRole);
router.delete('/:id',jwt_Middle, deleteUser)

module.exports = router;