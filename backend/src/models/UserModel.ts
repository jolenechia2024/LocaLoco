import { User, UpdateProfileData } from '../types/User.js';
import db from '../database/db.js'
import { user } from '../database/auth-schema.js';
import { and, or, ilike, eq, inArray, gte, sql, asc, desc } from 'drizzle-orm';

class UserModel {

    /**
     * Retrieves a user record from the database by its unique ID.
     *
     * @param {string} userId - The unique identifier of the user.
     * @returns {Promise<User | null>} The `User` object corresponding to the ID, or `null` if not found.
     */
    public static async getUserById(userId: string) {
        try {
            console.log('🔍 getUserById called with userId:', userId);
            const result = await db.select().from(user).where(eq(user.id, userId)).limit(1);
            console.log('📊 Query result:', result);
            return result[0] || null;
        } catch (error) {
            console.error('❌ Error fetching user:', error);
            throw error;
        }
    }

    /**
     * Updates the profile information of a user in the database.
     *
     * Accepts partial updates for the user's `name`, `email`, and `image`.
     * Only the fields provided in `updates` are modified, leaving other fields unchanged.
     *
     * @param {string} userId - The unique identifier of the user to update.
     * @param {UpdateProfileData} updates - Object containing the profile fields to update.
     * @returns {Promise<User>} The updated `User` object reflecting the changes.
     */
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
            if (updates.email !== undefined) updateData.email = updates.email;

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
