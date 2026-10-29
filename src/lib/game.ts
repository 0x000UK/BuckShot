import { z } from "zod";
import { ALL_GAME_TAG_VALUES } from "@/lib/constants/tags";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const GameTagEnum = z.enum(
    ALL_GAME_TAG_VALUES,
    { error: "Please select a valid game tag." }
);

const GameStatusEnum = z.enum(
    ["published", "draft", "delisted"],
    { error: "Please select a valid game status." }
);

const PlatformEnum = z.enum(
    ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch", "macOS", "Linux"],
    { error: "Please select a valid target platform." }
);

const AgeRatingEnum = z.enum(
    ["E", "T", "M", "AO", "PEGI 3", "PEGI 7", "PEGI 12", "PEGI 16", "PEGI 18", "IARC 3", "IARC 7", "IARC 12", "IARC 16", "IARC 18", "Unrated"],
    { error: "A valid age rating is required." }
);

const ContentDescriptorEnum = z.enum(
    ["Blood and Gore", "Intense Violence", "Strong Language", "Sexual Themes", "Nudity", "Use of Drugs", "In-Game Purchases"],
    { error: "Please select a valid content descriptor." }
);

const MediaItemSchema = z.object({
	id:	  	z.string("Image ID is required").min(1, "Image ID cannot be empty"),
	type: 	z.enum(["image", "video"]),
	url: 	z.url("Must be a valid URL address").optional().or(z.literal("")),
	title: 	z.string().optional(),

	file: 	z.instanceof(File,{ message: "Input must be a valid File object" }).optional()
		.refine((file) => {
			if (!file || file.name === "" || file.size === 0) return true;
			return file.size > 0;
		}, "File cannot be empty")
		.refine((file) => {
			if (!file || file.name === "" || file.size === 0) return true;
			return file.size <= MAX_FILE_SIZE;
		}, "Image must be under 5MB")
		.refine((file) => {
			if (!file || file.name === "" || file.size === 0) return true;
			return ACCEPTED_IMAGE_TYPES.includes(file.type);
		}, "Only .jpg, .png, and .webp images are allowed"),

	size: z.enum(['def', 'sqr', 'wide']).nullish(),
}).refine(
		(data) => {
			const hasImage = data.url && data.url.trim() !== "";
			const hasFile = data.file && data.file.name !== "" && data.file.size > 0;
			return !!(hasImage || hasFile);
		},
		{
			message: "Either a valid asset URL or local File upload is required",
        	path: ["url","file"],
		}
);

const SystemSpecsSchema = z.object({
	architecture: z.string().nullish(),
	os: 		z.string().min(1, "OS is required"),
	cpu: 		z.string().min(1, "CPU is required"),
	ram: 		z.string().min(1, "RAM is required"),
	gpu: 		z.string().min(1, "GPU is required"),
	storage: 	z.string().min(1, "Storage is required"),
	directX: 	z.string().nullish(),
	soundcard: 	z.string().nullish(),
	network: 	z.string().nullish(),
	others: 	z.string().nullish(),
	notes: 		z.string().nullish()
});

const TagFeaturesSchema = z.object({
	type: 	GameTagEnum,
	image: 	z.url('Image must be a valid URL').or(z.literal("")).nullish(),
	video: 	z.url('Video Must be a valid URL').or(z.literal("")).nullish(),
	blurb: 	z.string().optional().nullish()
}).refine((data) => {
	const hasImage = !!(data.image && data.image.trim() !== "");
    const hasVideo = !!(data.video && data.video.trim() !== "");
    return hasImage || hasVideo;
}, {
	message: "At least one target media asset URL (Image or Video) must be provided",
    path: ["image"],
})

const SystemRequirementsSchema = z.object({
	minimum: SystemSpecsSchema,
	recommended: SystemSpecsSchema,
});

const DownloadUrlSchema = z.string().trim().min(1, "URL is required").refine(
	(v) => /^(https?:\/\/|magnet:\?|ftp:\/\/)/i.test(v) || /^[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(v),
	"Must be a valid web URL or magnet link"
);

export const StorePriceEditionSchema = z.object({
	id: z.string().optional(),
	edition: z.string().trim().min(1, "Edition name is required"),
	price: z.string().trim().min(1, "Price is required"),
	regularPrice: z.string().trim().nullish(),
	discountPercent: z.number().nullish(),
	url: z.string().trim().nullish().or(z.literal("")),
	isLowestPrice: z.boolean().nullish(),
});
export type StorePriceEdition = z.infer<typeof StorePriceEditionSchema>;

export const OfficialDownloadSchema = z.object({
	id: 	z.string(),
	name: 	z.string().trim().min(1, "Platform or store name is required"),
	url: 	DownloadUrlSchema,
	logo: 	z.string().trim().nullish().or(z.literal("")),
	price: 	z.string().nullish(),
	badge: 	z.string().nullish(),
	editions: z.array(StorePriceEditionSchema).nullish(),
});
export type OfficialDownload = z.infer<typeof OfficialDownloadSchema>;

export const DownloadCategoryEnum = z.enum(
	["Repack", "Direct", "Torrent", "Crack Fix", "Update Patch", "Other"]
);

export const NonOfficialDownloadSchema = z.object({
	id: 		z.string(),
	siteName: 	z.string().trim().min(1, "Site name is required"),
	url: 		z.array(DownloadUrlSchema).min(1, "Add at least one download URL"),
	logo: 		z.string().trim().nullish().or(z.literal("")),
	category: 	DownloadCategoryEnum,
	fileSize: 	z.string().nullish(),
	version: 	z.string().nullish(),
	notes: 		z.string().nullish(),
});
export type NonOfficialDownload = z.infer<typeof NonOfficialDownloadSchema>;

export const DownloadSourceSchema = z.object({
	id: 	z.string("Source ID record is required"),
	host: 	z.string("Host identifier is required").trim().min(1, "Host platform name is required"),
	url: 	z.array(z.url("Each anchor must be a valid operational URL")).min(1, "Add at least one download URL"),
});

const AdditionalContentSchema = z.object({
	id: 		z.string(),
	title: 		z.string("Content title is required").trim().min(1, "Title is required").max(80, "Title is too long"),
	image: 		MediaItemSchema,
	type: 		z.string().nullish(),
});

const JSONNodeSchema = z.object({
	type: z.string(),
	content: z.string().nullish(),
	src: z.string().nullish(),
	autoplay: z.boolean().nullish(),
	loop: z.boolean().nullish(),
	muted: z.boolean().nullish(),
	controls: z.boolean().nullish(),
	hoverPlay: z.boolean().nullish(),
	tapToggle: z.boolean().nullish(),
	href: z.string().nullish(),
	classes: z.array(z.string()).nullish(),
	get children() {
		return z.array(JSONNodeSchema).optional()
	}
})

const JSONRootSchema = z.object({
	type: z.literal("root"),
	children: z.array(JSONNodeSchema),
});

export const GameFaqItemSchema = z.object({
	title: z.string().min(1, "Question / Title is required"),
	body: z.string().min(1, "Answer / Body is required"),
	category: z.string(),
});
export type GameFaqItem = z.infer<typeof GameFaqItemSchema>;

export const GameValidationSchema = z.object({
	id: 		z.string().nullable(),
	title: 		z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
	subtitle: 	z.string().max(120, "Subtitle must be under 120 characters").nullish(),
	slug:		z.string().nullish(),
	synopsis: 	z.string().min(10, "Synopsis must be at least 10 characters").max(400, "Synopsis must be under 400 characters"),
	edition: 	JSONRootSchema.nullish(),
	description:JSONRootSchema,
	status:		GameStatusEnum,
	tags: 		z.array(GameTagEnum).nullish(),
	score: 		z.number().min(0, "Score cannot be negative").max(100, "Score cannot exceed 100"),
	reviewCount:z.number().int().nonnegative("Review count cannot be negative").nullish(),

	// Metadata
	developer: 	z.string().min(2, "Developer is required").max(50),
	publisher: 	z.string().min(2, "Publisher is required").max(50),
	franchise: 	z.string().max(100).nullish(),
	releaseDate:z.string().min(1, "Release date is required").refine((d) => !isNaN(Date.parse(d)), "Must be a valid date"),
	platforms: 	z.array(PlatformEnum).min(1, "Select at least one platform"),
	version: 	z.string().max(12).nullish(),
	genres: 	z.array(z.string()).min(1, "At least one genre is required"),
	genreDetails: z.array(z.object({
		id: z.string(),
		name: z.string(),
		slug: z.string(),
	})).nullish(),

	// Visuals
	logo: 			MediaItemSchema,
	cover: 			MediaItemSchema,
	wideCover: 		MediaItemSchema.nullish(),
	banner: 		MediaItemSchema,
	screenShots: 	z.array(MediaItemSchema).max(25, "Maximum 25 screenshots allowed"),
	banner2: 		MediaItemSchema.nullish(),
	ambientColor: 	z.string().regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/, "Must be a valid 6 or 8-digit HEX color"),

	requirements: 	z.record(z.string(), SystemRequirementsSchema),

	// Downloads
	officialDownloads: 		z.array(OfficialDownloadSchema).nullish(),
	nonOfficialDownloads: 	z.array(NonOfficialDownloadSchema).nullish(),

	bonusContent: 	z.array(AdditionalContentSchema).nullish(),
	dlcs: 			z.array(AdditionalContentSchema).nullish(),

	age: 			z.number().int().min(3, "Minimum age cannot be less than 3").max(21),
	ageRating: 		AgeRatingEnum,
	descriptors:	z.array(ContentDescriptorEnum).nullish(),

	tagFeatures:		z.array(TagFeaturesSchema).nullish(),
	faqs:				z.array(GameFaqItemSchema).nullish()
});

export const GenreValidationSchema = z.object({
	name : z.string().min(3, "Genre name must be atleast 3 characters").max(30, "Genre name must not exceed 30 characters"),
	slug : z.string().regex(/^[a-z-]+$/, "Must contain only lowercase letters and hyphens"),
	image : MediaItemSchema.nullish()
})

export type GameData = z.infer<typeof GameValidationSchema>
export type JSONNode = z.infer<typeof JSONNodeSchema>
export type JSONRoot = z.infer<typeof JSONRootSchema>
