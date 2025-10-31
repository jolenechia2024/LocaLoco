import { Request, Response, NextFunction } from "express";
import UserModel from "../models/UserModel.js";

class UserController {
    // Update user profile
    static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, name, image } = req.body;

            console.log('Update profile request:', { userId, name, imageLength: image?.length });

            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }

            // Prepare update data
            const updates: any = {};
            if (name !== undefined) updates.name = name;
            if (image !== undefined) updates.image = image;

            // Check if there's anything to update
            if (Object.keys(updates).length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            console.log('Updates to apply:', Object.keys(updates));

            const updatedUser = await UserModel.updateProfile(userId, updates);

            if (!updatedUser) {
                res.status(404).json({ error: 'User not found after update' });
                return;
            }

            res.status(200).json({
                message: 'Profile updated successfully',
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    image: updatedUser.image,
                    createdAt: updatedUser.createdAt,
                }
            });
        } catch (error: any) {
            if (error.message === 'User not found') {
                res.status(404).json({ error: 'User not found' });
            } else {
                console.error('Error updating profile:', error);
                res.status(500).json({ error: 'Failed to update profile' });
            }
        }
    }

    // Get user profile
    static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.userId || req.query.userId as string;

            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }

            const user = await UserModel.getUserById(userId);

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                hasBusiness: user.hasBusiness,
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    }
}

export default UserController;
