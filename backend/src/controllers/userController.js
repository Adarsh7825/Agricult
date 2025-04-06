const User = require('../models/User');

// Get current user profile
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user,
            message: 'User profile retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            phone,
            farmSize,
            farmSizeUnit,
            primaryCrops,
            farmingType,
        } = req.body;

        // Find user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (farmSize) user.farmSize = farmSize;
        if (farmSizeUnit) user.farmSizeUnit = farmSizeUnit;
        if (primaryCrops) user.primaryCrops = primaryCrops;
        if (farmingType) user.farmingType = farmingType;

        await user.save();

        res.status(200).json({
            success: true,
            user,
            message: 'User profile updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Update user location
exports.updateUserLocation = async (req, res, next) => {
    try {
        const {
            coordinates,
            address
        } = req.body;

        // Find user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update location
        if (coordinates) user.location.coordinates = coordinates;
        if (address) user.location.address = address;

        await user.save();

        res.status(200).json({
            success: true,
            user,
            message: 'User location updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Change user password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Find user with password
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Set new password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
}; 