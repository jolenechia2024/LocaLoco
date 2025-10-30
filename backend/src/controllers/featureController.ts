import { Request, Response, NextFunction } from "express";
import ReviewModel from "../models/ReviewModel.js";
import ForumModel from "../models/ForumModel.js";

class FeatureController {
 
    static async getBusinessReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reviews = await ReviewModel.getBusinessReviews(String(req.query.uen));
            res.status(200).json(reviews)
        } 
        catch (error) {
            next(error);
        }
    }
    
    static async getAllForumPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const forumPosts = await ForumModel.getAllForumPosts();
            res.status(200).json(forumPosts)
        }
        catch (error) {
            next(error);
        }
    }

    static async createForumPost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const postData = req.body;
            await ForumModel.newForumPost(postData);
            res.status(201).json({ message: 'Forum post created successfully' });
        }
        catch (error) {
            next(error);
        }
    }

    static async createForumReply(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const replyData = req.body;
            await ForumModel.newForumReply(replyData);
            res.status(201).json({ message: 'Reply created successfully' });
        }
        catch (error) {
            next(error);
        }
    }

    static async updatePostLikes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { postId, clicked } = req.body;
            const result = await ForumModel.updatePostLikes(postId, clicked);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}

export default FeatureController