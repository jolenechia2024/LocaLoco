import { Router } from "express";
import FeatureController from "../controllers/featureController.js";

const featureRouter = Router()

// this route fetches all the reviews for a business
featureRouter.get('/api/reviews', FeatureController.getBusinessReviews.bind(FeatureController))

// Forum routes
featureRouter.get('/api/forum-posts', FeatureController.getAllForumPosts.bind(FeatureController))
featureRouter.post('/api/forum-posts', FeatureController.createForumPost.bind(FeatureController))
featureRouter.post('/api/forum-replies', FeatureController.createForumReply.bind(FeatureController))
featureRouter.put('/api/forum-posts/likes', FeatureController.updatePostLikes.bind(FeatureController))

// this route handles submissions for forum posts
featureRouter.post('/api/submit-post', FeatureController.newForumPost.bind(FeatureController))

// this route handles submissions for user reviews for businesses
featureRouter.post('/api/submit-review', FeatureController.newReview.bind(FeatureController))

export default featureRouter