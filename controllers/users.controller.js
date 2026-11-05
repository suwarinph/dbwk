const User = require('../models/user.model');
const mongoose = require('mongoose');

exports.approveUser = async (req, res) => {
    try {
        // 1. ตรวจสอบว่าเป็น Admin จริงไหม
        const admin = await User.findById(req.auth.userId);

        if (!admin || admin.role !== 'admin') {
            return res.status(401).json({
                status: 401,
                message: 'Admin access required',
                data: null
            });
        }

        // 2. ตรวจสอบ ID ที่ต้องการ Approve
        const userId = req.params.id;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid user ID',
                data: null
            });
        }

        // 3. ค้นหา User
        const user = await User.findById(userId);

        if (!user || user.role !== 'user') {
            return res.status(400).json({
                status: 400,
                message: 'User not found',
                data: null
            });
        }

        // 4. อนุมัติ User
        user.isApproved = true;
        await user.save();

        // 5. ส่ง Response
        return res.status(200).json({
            status: 200,
            message: 'User approved successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                isApproved: user.isApproved
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            data: null
        });
    }
};