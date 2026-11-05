
const bcrypt = require('bcrypt');
const userSchema = require('../models/user.model');
const jwt = require('jsonwebtoken');


const registerUser = async (req, res) => {
   try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
        return res.status(400).json({ Status: 400, Message: 'Please provide all fields', Data: null });
        }
        const existingUser = await userSchema.findOne({ email });

        if (existingUser) {
            return res.status(400).json({Status: 400,Message: 'Email already exists',Data: null});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = await userSchema.create({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        isApproved: false,
        });

        return res.status(201).json({
        Status: 201,
        Message: 'Register successful, waiting for approval',
            Data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ Status: 500, Message: 'Server error', Data: null });
  }
};

const login = async (req, res) => {
    try {
        
        const { email, password } = req.body;
        if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
            return res.status(400).json({Status: 400,Message: 'Email and password are required',Data: null});
        }

        const user = await userSchema.findOne({ email });

        if (!user) {
            return res.status(401).json({Status: 401,Message: 'Invalid email or password',Data: null});
        }

        // ตรวจPassword
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({Status: 401,Message: 'Invalid email or password',Data: null});
        }

        // ตรวจสอบว่า Approve ยัง
        if (!user.isApproved) {
            return res.status(401).json({Status: 401,Message: 'Waiting for admin approval',Data: null});
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        return res.status(200).json({
            Status: 200,
            Message: 'Login successful',
            Data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({ Status: 500, Message: 'Internal server error', Data: null });
    }
};

module.exports = { registerUser, login };