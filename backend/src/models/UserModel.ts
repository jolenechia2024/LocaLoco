import { User, UpdateProfileData } from '../types/User.js';
import db from '../database/db.js'
import { referrals, user, userPoints, vouchers } from '../database/schema.js';
import { and, or, ilike, eq, inArray, gte, sql, asc, desc } from 'drizzle-orm';
import { date } from 'better-auth';

class UserModel {
    
    /**
     * Retrieves a user record from the database by its unique ID.
     * 
     * Searches the `user` table for a record that matches the provided `userId`. 
     * Returns the first matching user object if found, or `null` if no such user exists.
     * 
     * @param {string} userId - The unique identifier of the user.
     * @returns {Promise<User | null>} The `User` object corresponding to the ID, or `null` if not found.
     */
    public static async getProfile(userId: string) {
        try {
            const profile = await db.select().from(user).where(eq(user.id, userId))
            
            // Fetch vouchers with referral code (join with referrals table)
            const vouchersWithReferralCode = await db
                .select({
                    voucherId: vouchers.voucherId,
                    userId: vouchers.userId,
                    refId: vouchers.refId,
                    amount: vouchers.amount,
                    status: vouchers.status,
                    issuedAt: vouchers.issuedAt,
                    expiresAt: vouchers.expiresAt,
                    referralCode: referrals.referralCode
                })
                .from(vouchers)
                .leftJoin(referrals, eq(vouchers.refId, referrals.refId))
                .where(eq(vouchers.userId, userId));
            
            // Count successful referrals (where this user is the referrer and status is 'claimed')
            const successfulReferralsResult = await db
                .select()
                .from(referrals)
                .where(and(
                    eq(referrals.referrerId, userId),
                    eq(referrals.status, 'claimed')
                ));
            
            const successfulReferralsCount = successfulReferralsResult.length;
            const availablePoints = await db.select().from(userPoints).where(eq(userPoints.userEmail, profile[0]!.email))

            return {
                profile: profile[0] || null,
                vouchers: vouchersWithReferralCode,
                successfulReferrals: successfulReferralsCount,
                points: availablePoints[0]!.points
            }
        } 
        catch (error) {
            console.error(`Error fetching user: ${userId}`);
            throw error;
        }
    }

    /**
     * Updates the profile information of a user in the database.
     * 
     * Accepts partial updates for the user's `name`, `email`, and `image`. 
     * Only the fields provided in `updates` are modified, leaving other fields unchanged. 
     * After updating, fetches and returns the fully updated user object.
     * 
     * @param {string} userId - The unique identifier of the user to update.
     * @param {UpdateProfileData} updates - Object containing the profile fields to update.
     * @returns {Promise<User>} The updated `User` object reflecting the changes.
     */
    public static async updateProfile(userId: string, updates: UpdateProfileData) {
        try {
            console.log('🟢 UserModel.updateProfile called');
            console.log('🟢 userId:', userId);
            console.log('🟢 updates:', JSON.stringify(updates, null, 2));

            // Update only the fields that are provided
            const updateData: any = {};
            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.email !== undefined) updateData.email = updates.email;

            console.log('🟢 updateData to be written to DB:', JSON.stringify(updateData, null, 2));

            // Perform the update
            const updateResult = await db.update(user)
                .set(updateData)
                .where(eq(user.id, userId));

            console.log('🟢 Database update result:', JSON.stringify(updateResult, null, 2));

            // Fetch and return the updated user
            const updatedUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);
            console.log('🟢 Fetched updated user from DB:', JSON.stringify(updatedUser, null, 2));

            return updatedUser[0];
        } catch (error) {
            console.error('❌ Error updating profile in UserModel:', error);
            throw error;
        }
    }

    // Get user by ID
    public static async (userId: string) {
        try {
            await db.delete(user).where(eq(user.id, userId))
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    public static async handleReferral(referralCode: string, referredId: string) {
        try {

            // Check if referral code is valid
            const referrerResult = await db.select()
                .from(user)
                .where(eq(user.referralCode, referralCode));
            
            if (referrerResult.length === 0) {
                console.log("Referral check failed: Code not found.");
                return false; // Code doesn't exist
            }

            const referrerUser = referrerResult[0]!;

            // Prevent self-referral
            if (referrerUser.id === referredId) {
                console.log("Referral check failed: User cannot refer themselves.");
                return false;
            }

            // Check if user (referredId) has already been referred
            const referredUserCheck = await db.select({ 
                    referredByUserID: user.referredByUserId 
                }).from(user).where(eq(user.id, referredId));

            if (referredUserCheck[0]?.referredByUserID) {
                console.log("Referral check failed: User already has a referrer.");
                return false;
            }

            // === 2. TRANSACTION (All writes) ===
            const transactionResult = await db.transaction(async (tx) => {
                
                const now = new Date();
                const expiryDate = new Date(now);
                expiryDate.setMonth(expiryDate.getMonth() + 1);
                
                // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
                const mysqlNow = now.toISOString().slice(0, 19).replace('T', ' ');
                const mysqlExpiry = expiryDate.toISOString().slice(0, 19).replace('T', ' ');
                
                // Insert the referral record
                const referralInsertResult = await tx.insert(referrals).values({
                    referrerId: referrerUser.id,
                    referredId: referredId,
                    referralCode,
                    status: "claimed",
                    referredAt: mysqlNow
                });
                
                const newReferralId = referralInsertResult[0].insertId;

                // Insert voucher for the REFERRED user
                await tx.insert(vouchers).values({
                    userId: referredId,
                    refId: newReferralId,
                    amount: 5,
                    status: 'issued',
                    issuedAt: mysqlNow,
                    expiresAt: mysqlExpiry
                });

                // Insert voucher for the REFERRER user
                await tx.insert(vouchers).values({
                    userId: referrerUser.id,
                    refId: newReferralId,
                    amount: 5,
                    status: 'issued',
                    issuedAt: mysqlNow,
                    expiresAt: mysqlExpiry
                });

                // update the new user referredByUserID column
                await tx.update(user).set({
                    referredByUserId: referrerUser.id,
                }).where(eq(user.id, referredId))

                return true;
            });
            
            return transactionResult; 
        } 
        catch (error) {

            console.error('Error handling referral:', error);
            throw error;
        }
    }

    /**
     * Gets the authentication provider for a user (e.g., 'google', 'email', null).
     *
     * @param {string} userId - The unique identifier of the user.
     * @returns {Promise<string | null>} The provider ID ('google', 'facebook', etc.) or null for email/password users.
     */
    public static async getAuthProvider(userId: string): Promise<string | null> {
        try {
            console.log('🔍 Checking account table for userId:', userId);

            // Check if user has any OAuth account linked (Google, Facebook, etc.)
            const accounts = await db
                .select()
                .from(account)
                .where(eq(account.userId, userId))
                .limit(1);

            console.log('📊 Account query result:', accounts);

            if (accounts.length > 0 && accounts[0]) {
                // User has an OAuth account, return the provider
                return accounts[0].providerId || null;
            }

            // No OAuth account found, user signed up with email/password
            return null;
        } catch (error) {
            console.error('❌ Error checking auth provider:', error);
            throw error;
        }
    }
}

export default UserModel
