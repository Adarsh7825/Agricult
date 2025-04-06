const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// Register a new user
exports.register = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            role,
            farmSize,
            farmSizeUnit,
            primaryCrops,
            farmingType,
            location,
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            role,
            farmSize,
            farmSizeUnit,
            primaryCrops,
            farmingType,
            location,
        });

        // Generate token
        const token = user.generateJwtToken();

        // Remove password from response
        user.password = undefined;

        res.status(201).json({
            success: true,
            token,
            user,
            message: 'User registered successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and include password for verification
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = user.generateJwtToken();

        // Remove password from response
        user.password = undefined;

        res.status(200).json({
            success: true,
            token,
            user,
            message: 'Logged in successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
    try {
        const user = req.user;

        // Generate new token
        const token = user.generateJwtToken();

        res.status(200).json({
            success: true,
            token,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Generate reset token
        const resetToken = user.generateResetToken();
        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;

        const message = `
            You requested a password reset. Please follow this link to reset your password:
            ${resetUrl}
            If you didn't request this, please ignore this email.
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Agricult Password Reset',
                message
            });

            res.status(200).json({
                success: true,
                message: 'Password reset email sent'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent',
                error: error.message
            });
        }
    } catch (error) {
        next(error);
    }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Generate new token
        const token = user.generateJwtToken();

        res.status(200).json({
            success: true,
            token,
            message: 'Password reset successful'
        });
    } catch (error) {
        next(error);
    }
}; 