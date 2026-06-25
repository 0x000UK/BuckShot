import { z, type nullish } from "zod";

// --- Base Enums ---
const GameTagEnum = z.enum(["new-release", "trending", "exclusive", "early-access", "featured", "coming-soon"])
const GameStatusEnum = z.enum(["published", "draft", "delisted"]);
const PlatformEnum = z.enum(["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch", "macOS", "Linux"]);
const AgeRatingEnum = z.enum(["E", "T", "M", "AO", "PEGI 3", "PEGI 7", "PEGI 12", "PEGI 16", "PEGI 18", "IARC 3", "IARC 7", "IARC 12", "IARC 16", "IARC 18", "Unrated"],
	{
		error : "Valid rating is required."
		
  	}
);
const ContentDescriptorEnum = z.enum(["Blood and Gore", "Intense Violence", "Strong Language", "Sexual Themes", "Nudity", "Use of Drugs", "In-Game Purchases"])
// --- Reusable Sub-Schemas ---
const ImageFileSchema = z.object({
	previewUrl: z.url("Valid URL or File is required"),
	title : z.string().optional(),
	file: z.any().optional(),
	size : z.enum(['def' , 'sqr' , 'wide']).nullish(),
	id : z.string()
});

const VideoResourseSchema = z.object({
	src : z.url("Video link must be a valid URL"),
	title : z.string().min(3, "Title must be atleast 3 characters long")
})

const SystemSpecsSchema = z.object({
	os: z.string().min(1, "OS is required"),
	cpu: z.string().min(1, "CPU is required"),
	ram: z.string().min(1, "RAM is required"),
	gpu: z.string().min(1, "GPU is required"),
	storage: z.string().min(1, "Storage is required"),
	directX: z.string().nullish(),
	other: z.string().nullish()
});


const SystemRequirementsSchema = z.object({
  	minimum:     SystemSpecsSchema,
  	recommended: SystemSpecsSchema,
});


const DownloadSourceSchema = z.object({
	id:    z.string(),
  	host:  z.string().min(1, "Host name is required"),
 	url:   z.array(z.string().url("Each URL must be valid")).min(1, "Add at least one download URL"),
});

const AdditionalContentSchema = z.object({
	id: z.string(),
	title: z.string().min(1, "Title is required").max(120, "Title is too long"),
	imageFile: ImageFileSchema,
	type: z.string().nullish(),
});

export const GenreSchema = z.object({
	id: z.string(),
	name: z.string().min(2, "Genre name must be at least 2 characters"),
	slug: z.string().nullish(),
	gameCount: z.number(),
	createdAt: z.string().nullish(),
})

const JSONNodeSchema = z.object({
	type:     z.string(),
	content:  z.string().nullish(),
	src:      z.string().nullish(),
	autoplay: z.boolean().nullish(),
	loop:     z.boolean().nullish(), 
	muted:		z.boolean().nullish(), 
	controls: 	z.boolean().nullish(),
	hoverPlay : z.boolean().nullish(),
	tapToggle : z.boolean().nullish(),
	href:     z.string().nullish(),
	classes:  z.array(z.string()).nullish(),
	get children() {
		return z.array(JSONNodeSchema).optional()
	}
})
  
export const JSONRootSchema = z.object({
    type:     z.literal("root"),
    children: z.array(JSONNodeSchema),
});


// --- Main Game Schema ---
export const GameValidationSchema = z.object({
	id: z.string(),
  	// Top-level fields
  	title: 		z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
  	subtitle: 	z.string().max(120, "Subtitle must be under 120 characters").nullish(),
  	synopsis: 	z.string().min(10, "Synopsis must be at least 10 characters").max(400, "Synopsis must be under 400 characters"),
	edition:	JSONRootSchema.nullish(),
  	description:JSONRootSchema,
	status:		GameStatusEnum,
	tags: 		z.array(GameTagEnum),
	score:      z.number().min(0, "Score cannot be negative").max(100, "Score cannot exceed 100"),
  	reviewCount:z.number().int().nonnegative("Review count cannot be negative").nullish(),


	// Metadata
	developer:  z.string().min(1, "Developer is required").max(100),
  	publisher:  z.string().min(1, "Publisher is required").max(100),
  	franchise:  z.string().max(100).nullish(),
	releaseDate:z.string().min(1, "Release date is required").refine((d) => !isNaN(Date.parse(d)), "Must be a valid date"),
	platforms: 	z.array(PlatformEnum).min(1, "Select at least one platform"),
	engine:    	z.string().max(80).nullish(),
  	version:   	z.string().max(10).nullish(),
	genres: 	z.array(GenreSchema).min(1, "At least one genre is required"),

	// Visuals
	logoImageFile:    ImageFileSchema,
	coverImageFile:   ImageFileSchema,
	bannerImageFile:  ImageFileSchema,
	previewImages:    z.array(ImageFileSchema).max(16, "Maximum 16 screenshots allowed"),
	bannerImageFile2: ImageFileSchema.nullable(),
	ambientColor:     z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid 6-digit HEX color (e.g. #1a2b3c)"),
	videoLinks:       z.array(VideoResourseSchema).nullish(),

	requirements: z.record(z.string(), SystemRequirementsSchema),


	// Arrays
	downloadBase: 	z.array(DownloadSourceSchema).min(1, "Atleast One downlaod host  is required"),
	downloadUpdate: z.array(DownloadSourceSchema).nullish(),
	bonusContent: 	z.array(AdditionalContentSchema).nullish(),
	dlcs: 			z.array(AdditionalContentSchema).nullish(),

	age:         z.number().int().min(3, "Minimum age cannot be less than 3").max(21),
  	ageRating:   AgeRatingEnum,
  	descriptors: z.array(ContentDescriptorEnum).optional(),


	based_on:           z.array(z.string().min(1)).nullish(),
  	game_version:       z.string().min(1, "Game version is required"),
  	repack_by:          z.string().nullish(),
  	repack_size:        z.string().min(1, "Repack size is required"),
  	final_size:         z.string().min(1, "Final installed size is required"),
	interface_language: z.string().nullish(),
	languages:          z.string().nullish(),
	audio_language:     z.string().nullish(),
	subtitle_language:  z.string().nullish(),
	lossless_repack:    z.string().nullish(),
	install_time:       z.string().min(1, "Install time is required"),
	crack:              z.string().nullish(),
	greetings:          z.array(z.string().min(1)).nullish(),


	createdAt: z.string().optional(),
	updatedAt: z.string().optional()
});

const GameSummarySchema = z.object({
	id:			z.string(),
	title: 		z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
	subtitle: 	z.string().max(120, "Subtitle must be under 120 characters").nullish(),
  	synopsis: 	z.string().min(10, "Synopsis must be at least 10 characters").max(400, "Synopsis must be under 400 characters"),
	developer: 	z.string(),
	tags: 		z.array(GameTagEnum),
	status:		GameStatusEnum,
	cover:   	z.url("Valid URL is required"),
	genres: 	z.array(z.string()).min(1, "At least one genre is required"),
	score:      z.number().min(0, "Score cannot be negative").max(100, "Score cannot exceed 100"),
	createdAt: 	z.string().optional(),
	updatedAt: 	z.string().optional()
})

export type GameData = 			z.infer<typeof GameValidationSchema>
export type GameSummary = 		z.infer<typeof GameSummarySchema>
export type Genre = 			z.infer<typeof GenreSchema>
export type ImageFile = 		z.infer<typeof ImageFileSchema>
export type SystemSpecs = 		z.infer<typeof SystemSpecsSchema>
export type AdditionalContent = z.infer<typeof AdditionalContentSchema>
export type GameStatus = 		z.infer<typeof GameStatusEnum>
export type GameTag =			z.infer<typeof GameTagEnum>
export type Platform = 			z.infer<typeof PlatformEnum>
export type ContentDescriptor = z.infer<typeof ContentDescriptorEnum>
export type AgeRating = 		z.infer<typeof AgeRatingEnum>
export type DownloadSource = 	z.infer<typeof DownloadSourceSchema>
export type JSONNode = 			z.infer<typeof JSONNodeSchema>
export type JSONRoot = 			z.infer<typeof JSONRootSchema>
