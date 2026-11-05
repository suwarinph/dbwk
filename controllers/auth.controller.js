
const bcrypt = require('bcrypt');
const userSchema = require('../models/user.model');
const jwt = require('jsonwebtoken');


const registerUser = async (req, res) => {
   try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
        return res.status(400).json({ status: 400, message: 'Please provide all fields', data: null });
        }
        const existingUser = await userSchema.findOne({ email });

        if (existingUser) {
            return res.status(400).json({status: 400,message: 'Email already exists',data: null});
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
        status: 201,
        message: 'Register successful, waiting for approval',
            data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Server error', data: null });
  }
};

const login = async (req, res) => {
    try {
        
        const { email, password } = req.body;
        if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
            return res.status(400).json({status: 400,message: 'Email and password are required',data: null});
        }

        const user = await userSchema.findOne({ email });

        if (!user) {
            return res.status(401).json({status: 401,message: 'Invalid email or password',data: null});
        }

        // ตรวจPassword
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({status: 401,message: 'Invalid email or password',data: null});
        }

        // ตรวจสอบว่า Approve ยัง
        if (!user.isApproved) {
            return res.status(401).json({status: 401,message: 'Waiting for admin approval',data: null});
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

        return res.status(200).json({status: 200,message: 'Login successful',
            data: {
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

        return res.status(500).json({ status: 500, message: 'Internal server error', data: null });
    }
};

module.exports = { registerUser, login };