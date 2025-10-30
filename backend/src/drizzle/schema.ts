import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, primaryKey, varchar, text, index, int, mysqlEnum, time, timestamp, tinyint, date, unique } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const account = mysqlTable("account", {
	id: varchar({ length: 36 }).notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "account_id"}),
]);

export const businessOpeningHours = mysqlTable("business_opening_hours", {
	id: int().autoincrement().notNull(),
	uen: varchar({ length: 20 }).notNull().references(() => businesses.uen, { onDelete: "cascade" } ),
	dayOfWeek: mysqlEnum("day_of_week", ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']).notNull(),
	openTime: time("open_time").notNull(),
	closeTime: time("close_time").notNull(),
},
(table) => [
	index("uen").on(table.uen),
	primaryKey({ columns: [table.id], name: "business_opening_hours_id"}),
]);

export const businessPaymentOptions = mysqlTable("business_payment_options", {
	id: int().autoincrement().notNull(),
	uen: varchar({ length: 20 }).notNull().references(() => businesses.uen, { onDelete: "cascade" } ),
	paymentOption: varchar("payment_option", { length: 50 }).notNull(),
},
(table) => [
	index("uen").on(table.uen),
	primaryKey({ columns: [table.id], name: "business_payment_options_id"}),
]);

export const businessReviews = mysqlTable("business_reviews", {
	id: int().autoincrement().notNull(),
	userEmail: varchar("user_email", { length: 255 }).notNull().references(() => user.email),
	businessUen: varchar("business_uen", { length: 20 }).references(() => businesses.uen),
	rating: int().notNull(),
	body: text().notNull(),
	likeCount: int("like_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "business_reviews_id"}),
]);

export const businesses = mysqlTable("businesses", {
	uen: varchar({ length: 20 }).notNull(),
	businessName: varchar("business_name", { length: 255 }).notNull(),
	businessCategory: varchar("business_category", { length: 100 }),
	description: text(),
	address: varchar({ length: 500 }),
	open247: tinyint().default(0),
	email: varchar({ length: 100 }),
	phoneNumber: varchar("phone_number", { length: 20 }),
	websiteLink: varchar("website_link", { length: 255 }),
	socialMediaLink: varchar("social_media_link", { length: 255 }),
	wallpaper: varchar({ length: 255 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dateOfCreation: date("date_of_creation", { mode: 'string' }),
	priceTier: mysqlEnum("price_tier", ['low','medium','high']),
	offersDelivery: tinyint("offers_delivery").default(0),
	offersPickup: tinyint("offers_pickup").default(0),
},
(table) => [
	primaryKey({ columns: [table.uen], name: "businesses_uen"}),
]);

export const forumPosts = mysqlTable("forum_posts", {
	id: int().autoincrement().notNull(),
	userEmail: varchar("user_email", { length: 255 }).notNull().references(() => user.email),
	businessUen: varchar("business_uen", { length: 20 }).references(() => businesses.uen),
	title: varchar({ length: 255 }),
	body: text().notNull(),
	likeCount: int("like_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
},
(table) => [
	index("business_uen").on(table.businessUen),
	index("user_email").on(table.userEmail),
	primaryKey({ columns: [table.id], name: "forum_posts_id"}),
]);

export const forumPostsReplies = mysqlTable("forum_posts_replies", {
	id: int().autoincrement().notNull(),
	postId: int("post_id").notNull().references(() => forumPosts.id, { onDelete: "cascade" } ),
	userEmail: varchar("user_email", { length: 255 }).notNull().references(() => user.email),
	body: text().notNull(),
	likeCount: int("like_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
},
(table) => [
	index("post_id").on(table.postId),
	index("user_email").on(table.userEmail),
	primaryKey({ columns: [table.id], name: "forum_posts_replies_id"}),
]);

export const referrals = mysqlTable("referrals", {
	id: int().autoincrement().notNull(),
	referrerUserId: varchar("referrer_user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	referredUserId: varchar("referred_user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`(now())`),
},
(table) => [
	index("referred_user_idx").on(table.referredUserId),
	index("referrer_user_idx").on(table.referrerUserId),
	primaryKey({ columns: [table.id], name: "referrals_id"}),
]);

export const session = mysqlTable("session", {
	id: varchar({ length: 36 }).notNull(),
	expiresAt: timestamp("expires_at", { fsp: 3, mode: 'string' }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: varchar("user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.id], name: "session_id"}),
	unique("session_token_unique").on(table.token),
]);

export const user = mysqlTable("user", {
	id: varchar({ length: 36 }).notNull(),
	name: text().notNull(),
	email: varchar({ length: 255 }).notNull(),
	emailVerified: tinyint("email_verified").default(0).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	hasBusiness: tinyint("has_business"),
	referralCode: text("referral_code"),
	referredByUserId: text("referred_by_user_id"),
},
(table) => [
	primaryKey({ columns: [table.id], name: "user_id"}),
	unique("user_email_unique").on(table.email),
]);

export const verification = mysqlTable("verification", {
	id: varchar({ length: 36 }).notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { fsp: 3, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
	updatedAt: timestamp("updated_at", { fsp: 3, mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "verification_id"}),
]);

export const vouchers = mysqlTable("vouchers", {
	id: int().autoincrement().notNull(),
	referrerUserId: varchar("referrer_user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	referredUserId: varchar("referred_user_id", { length: 36 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	referralCode: varchar("referral_code", { length: 10 }).notNull(),
	amount: int().notNull(),
	status: mysqlEnum(['issued','redeemed','expired']).default('issued'),
	issuedAt: timestamp("issued_at", { mode: 'string' }).default(sql`(now())`),
	redeemedAt: timestamp("redeemed_at", { mode: 'string' }),
},
(table) => [
	index("referred_user_idx").on(table.referredUserId),
	index("referrer_user_idx").on(table.referrerUserId),
	primaryKey({ columns: [table.id], name: "vouchers_id"}),
	unique("referral_code").on(table.referralCode),
]);
