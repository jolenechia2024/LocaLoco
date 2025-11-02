import { User } from '../types/User.js';
import db from '../database/db.js'
import { user } from '../database/auth-schema.js';
import { and, or, ilike, eq, inArray, gte, sql, asc, desc } from 'drizzle-orm';

interface UpdateProfileData {
    name?: string;
    image?: string;
}

class UserModel {
    // Update user profile
    public static async updateProfile(userId: string, updates: UpdateProfileData) {
        try {
            // Check if user exists
            const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);

            if (!existingUser || existingUser.length === 0) {
                throw new Error('User not found');
            }

            // Update only the fields that are provided
            const updateData: any = {};
            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.image !== undefined) updateData.image = updates.image;

            // Perform the update
            await db.update(user)
                .set(updateData)
                .where(eq(user.id, userId));

            // Fetch and return the updated user
            const updatedUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);
            return updatedUser[0];
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Deletes a user record from the database by its unique ID.
     *
     * @param {string} userId - The unique identifier of the user to delete.
     * @returns {Promise<void>} Resolves when the user record has been successfully removed.
     */
    public static async deleteProfile(userId: string) {
        try {
            await db.delete(user).where(eq(user.id, userId))
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}

export default UserModel