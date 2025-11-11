import { Announcement, UpdatedAnnouncement } from "../types/Announcement.js";
import db from "../database/db.js";
import { businessAnnouncements } from "../database/schema.js";
import { eq } from "drizzle-orm";

class AnnouncementModel {
    public static async newAnnouncement(
        announcement: Omit<Announcement, "updatedAt" | "announcementId">,
    ): Promise<void> {
        await db.insert(businessAnnouncements).values({
            businessUen: announcement.businessUen,
            title: announcement.title,
            content: announcement.content,
            imageUrl: announcement.imageUrl,
            createdAt: announcement.createdAt,
        });
    }

    public static async getAllAnnouncements() {
        const announcements = await db.select().from(businessAnnouncements);
        return announcements;
    }

    public static async getAnnouncementsByUEN(businessUen: string) {
        const announcements = await db
            .select()
            .from(businessAnnouncements)
            .where(eq(businessAnnouncements.businessUen, businessUen));
        return announcements;
    }

    public static async updateAnnouncement(
        announcementId: number,
        UpdatedAnnouncement: Omit<UpdatedAnnouncement, "updatedAt">,
    ) {
        await db
            .update(businessAnnouncements)
            .set(UpdatedAnnouncement)
            .where(
                eq(businessAnnouncements.announcementId, announcementId),
            );
    }

    public static async deleteAnnouncement(announcementId: number) {
        await db
            .delete(businessAnnouncements)
            .where(
                eq(businessAnnouncements.announcementId, announcementId),
            );
    }
}

export default AnnouncementModel;
