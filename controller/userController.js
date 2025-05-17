const User = require('../models/userModel')
const bcrypt = require('bcryptjs')



exports.createUser = async (req, res) => {
  const { username, email, role, password, group } = req.body;
  const { role: creatorRole, userId: creatorId } = req.user;
  try {
    if (
      (creatorRole == 'SUPER_ADMIN' && role !== 'ADMIN') ||
      (creatorRole == 'ADMIN' && role !== 'UNIT_MANAGER') ||
      (creatorRole == 'UNIT_MANAGER' && role !== 'USER')
    ) {
      return res.status(403).json({ error: 'Unauthorized role assignment' });
    }


    const hashPassword = await bcrypt.hash(password, 10);





    const prefix = role === 'ADMIN' ? 'A' : role === 'UNIT_MANAGER' ? 'UM' : 'U';

    let uniqueId;
    let isUnique = false;
    let attempt = 1;

    while (!isUnique && attempt <= 10) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      uniqueId = `${prefix}${randomNum}`;

      const exists = await User.exists({ uniqueId });
      if (!exists) {
        isUnique = true;
      } else {
        attempt++;
      }
    }



    const newUser = new User({
      username,
      email,
      role,
      password: hashPassword,
      createdBy: creatorId,
      group,
      uniqueId
    });
    if (!uniqueId) {
      return res.status(400).json({ error: 'uniqueId generation failed' });
    }
    // console.log("Hashed password:", hashPassword);


    await newUser.save();

    const userToReturn = newUser.toObject();
    delete userToReturn.password;
    res.status(201).json({ message: 'User created', user: userToReturn });


  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Duplicate uniqueId detected' });
    }
    res.status(500).json({ error: error.message });
  }
}

exports.getUsers = async (req, res) => {
  const { role, userId } = req.user;

  try {
    let filter = {};

    if (role === 'SUPER_ADMIN') {
      // No restriction
    } else if (role === 'ADMIN') {
      // Get Unit Managers and Users under this Admin or in same group
      filter = {
        $or: [
          { createdBy: userId },
          { group: { $in: await getUserGroupUsers(userId) } }
        ]
      };
    } else if (role === 'UNIT_MANAGER') {
      filter = {
        $or: [
          { createdBy: userId },
          { group: { $in: await getUserGroupUsers(userId) } }
        ]
      };
    } else {
      filter = { _id: userId }; // Regular users can only see themselves
    }

    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
    res.json({ message: 'Role updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const getUserGroupUsers = async (userId) => {
  const user = await User.findById(userId);
  if (!user?.group) return [];
  const groupUsers = await User.find({ group: user.group }).select('_id');
  return groupUsers.map(u => u.group);
};