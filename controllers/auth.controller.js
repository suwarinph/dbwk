
const bcrypt = require('bcrypt');
const userSchema = require('../models/user.model');

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ Status: 400, message: 'Please provide all fields', Data: null });
    }
    const existingUser = await userSchema.findOne({ email });

    if (existingUser) {
        return res.status(400).json({status: 400,message: 'Email already exists',data: null
        });
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
    return res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { registerUser };