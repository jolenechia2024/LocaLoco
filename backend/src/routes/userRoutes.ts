import { Router } from "express";
import UserController from "../controllers/userController.js";

const userRouter = Router();

// Get user profile by ID
userRouter.get('/api/users/profile/:userId', UserController.getProfile.bind(UserController));

// Update user profile
userRouter.put('/api/users/profile', UserController.updateProfile.bind(UserController));
userRouter.post('/api/user/update-profile', UserController.updateProfile.bind(UserController));

// delete user
userRouter.post('/api/user/delete-profile', UserController.deleteProfile.bind(UserController));

export default userRouter;
