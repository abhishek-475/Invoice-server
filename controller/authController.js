const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

exports.register = async (req, res) => {
    try {
        const { username, email, role, password, createdBy, group } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        const prefix = role === 'ADMIN' ? 'A' : role === 'UNIT_MANAGER' ? 'UM' : 'U';
        const count = await User.countDocuments({ role });
        const uniqueId = `${prefix}${count + 1}`;

        const newuser = new User({
            username,
            email,
            password: hashPassword,
            role,
            createdBy,
            group,
            uniqueId
        })

        await newuser.save()

        res.status(201).json({ message: 'Registered', userid: newuser.uniqueId })


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password, timezone } = req.body;

        if (!timezone) {
            return res.status(400).json({ error: 'Timezone Required' })
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        console.log('User:', user);
        console.log('Password:', password);
        console.log('Stored hash:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }


        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d' })

        user.timezone = timezone;
        await user.save();

        res.json({ token, role: user.role, timezone });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}