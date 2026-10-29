import mongoose, { type InferSchemaType } from "mongoose";
import CounterModel from "./counter.model";
import { slugify } from "@/lib/utils";
import { sqids } from "@/lib/sqids";
import { ALL_GAME_TAG_VALUES } from "@/lib/constants/tags";

const SystemSpecsSchema = new mongoose.Schema({
    architecture: { type: String },
    os: { type: String, required: [true, "OS is required"] },
    cpu: { type: String, required: [true, "CPU is required"] },
    ram: { type: String, required: [true, "RAM is required"] },
    gpu: { type: String, required: [true, "GPU is required"] },
    storage: { type: String, required: [true, "Storage is required"] },
    directX: { type: String },
    soundcard: { type: String },
    network: { type: String },
    others: { type: String },
    notes: { type: String },
}, { _id: false });

const SystemRequirementsSchema = new mongoose.Schema({
    minimum: { type: SystemSpecsSchema, required: true },
    recommended: { type: SystemSpecsSchema, required: true },
}, { _id: false });

const StorePriceEditionSchema = new mongoose.Schema({
    edition: { type: String, required: true, trim: true },
    price: { type: String, required: true, trim: true },
    regularPrice: { type: String, trim: true },
    discountPercent: { type: Number, default: 0 },
    url: { type: String, trim: true },
    isLowestPrice: { type: Boolean, default: false },
}, { _id: false });

const OfficialDownloadSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Store or platform name is required"], trim: true },
    url: { type: String, required: [true, "Store URL is required"], trim: true },
    logo: { type: String, trim: true },
    price: { type: String, trim: true },
    badge: { type: String, trim: true },
    editions: [StorePriceEditionSchema],
}, { _id: false });

const NonOfficialDownloadSchema = new mongoose.Schema({
    siteName: { type: String, required: [true, "Site name is required"], trim: true },
    url: [{ type: String, required: true, trim: true }],
    logo: { type: String, trim: true },
    category: {
        type: String,
        enum: ["Repack", "Direct", "Torrent", "Crack Fix", "Update Patch", "Other"],
        default: "Repack"
    },
    fileSize: { type: String, trim: true },
    version: { type: String, trim: true },
    notes: { type: String, trim: true },
}, { _id: false });

const DownloadSchema = new mongoose.Schema({
    official: [OfficialDownloadSchema],
    nonOfficial: [NonOfficialDownloadSchema],
}, { _id: false });

const AdditionalContentSchema = new mongoose.Schema({
    title: { type: String, required: [true, "Title is required"] },
    image: { type: String, required: [true, "Image is required"] },
    type: { type: String },
    size: {
        type: String,
        enum: {
            values: ["def", "sqr", "wide"],
            message: "{VALUE} is not a valid size",
        },
        default: "def"
    }
}, { _id: false });

const MetadataSchema = new mongoose.Schema({
    developer: { type: String, required: [true, "Developer is required"] },
    publisher: { type: String, required: [true, "Publisher is required"] },
    franchise: { type: String },
    releaseDate: { type: Date, required: [true, "Release date is required"] },
    genres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Genre",
        required: true,
    }],
    version: { type: String },
    platforms: [{
        type: String,
        enum: {
            values: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch", "macOS", "Linux"],
            message: "{VALUE} is not a valid platform",
        },
    }],
}, { _id: false });

const VisualsSchema = new mongoose.Schema({
    logo: { type: String, required: [true, "Logo image is required"] },
    cover: { type: String, required: [true, "Cover image is required"] },
    wideCover: { type: String },
    banner: { type: String, required: [true, "Banner image is required"] },
    banner2: { type: String },
    screenShots: [
        {
            _id : false,
            type : {type : String , enum : ["image", "video"] , required : true},
            src: { type: String, required: true },
            title: { type: String, required: true }
        }
    ],
    ambientColor: {
        type: String,
        required: [true, "Ambient color is required"],
        match: [/^#[0-9A-Fa-f]{6}$/, "ambientColor must be a valid 6-digit HEX"],
    },
}, { _id: false });

const ContentTypeSchema = new mongoose.Schema({
    age: {
        type: Number,
        min: [3, "Age cannot be less than 3"],
        max: [21, "Age cannot exceed 21"],
        required: true
    },
    ageRating: {
        type: String,
        enum: {
            values: ["E", "T", "M", "AO", "PEGI 3", "PEGI 7", "PEGI 12", "PEGI 16", "PEGI 18", "IARC 3", "IARC 7", "IARC 12", "IARC 16", "IARC 18", "Unrated"],
            message: "{VALUE} is not a valid age rating",
        },
        required: true
    },
    descriptors: [{
        type: String,
        enum: {
            values: ["Blood and Gore", "Intense Violence", "Strong Language", "Sexual Themes", "Nudity", "Use of Drugs", "In-Game Purchases"],
            message: "{VALUE} is not a valid content descriptor",
        },
    }],
}, { _id: false });

const RatingSchema = new mongoose.Schema({
    score: {
        type: Number,
        required: [true, "Score is required"],
        min: [0, "Score cannot be negative"],
        max: [100, "Score cannot exceed 100"],
    },
    reviewCount: {
        type: Number,
        min: [0, "Review count cannot be negative"],
    },
}, { _id: false });

const GameFaqSchema = new mongoose.Schema({
    title: { type: String, required: [true, "FAQ title is required"], trim: true },
    body: { type: String, required: [true, "FAQ body is required"] },
    category: { type: String, default: "General", trim: true },
}, { _id: false });

const TagFeatureSchema = new mongoose.Schema({
    type: { type: String, required: true },
    image: { type: String },
    video: { type: String },
    blurb: { type: String }
}, { _id: false });

const JSONNodeSchema = new mongoose.Schema({
    type: { type: String, required: true },
    content: { type: String },
    src: { type: String },

    autoplay: { type: Boolean },
    loop: { type: Boolean },
    muted: { type: Boolean },
    controls: { type: Boolean },
    hoverPlay: { type: Boolean },
    tapToggle: { type: Boolean },

    href: { type: String },
    classes: { type: [String], default: undefined },
    children: { type: [mongoose.Schema.Types.Mixed] }
}, { _id: false });

JSONNodeSchema.add({
    children: { type: [JSONNodeSchema], default: undefined }
});

const JSONRootSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['root'], default: 'root' },
    children: { type: [JSONNodeSchema], required: true }
}, { _id: false });

const GameSchema = new mongoose.Schema({
    gameId: {
        type: Number,
        unique: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [100, "Title must be under 100 characters"],
    },
    subtitle: {
        type: String,
        maxlength: [120, "Subtitle must be under 120 characters"],
    },
    slug: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    synopsis: {
        type: String,
        required: [true, "Synopsis is required"],
        minlength: [10, "Synopsis must be at least 10 characters"],
        maxlength: [400, "Synopsis must be under 400 characters"],
    },
    edition: { type: JSONRootSchema },
    description: { type: JSONRootSchema, required: true },
    status: {
        type: String,
        enum: {
            values: ["published", "draft", "delisted"],
            message: "{VALUE} is not a valid status",
        },
        default: "draft",
        required: [true, "Status is required"],
    },
    tags: [{
        type: String,
        enum: {
            values: ALL_GAME_TAG_VALUES,
            message: "{VALUE} is not a valid tag",
        },
    }],

    metadata: { type: MetadataSchema, required: true },
    visuals: { type: VisualsSchema, required: true },
    contentType: { type: ContentTypeSchema, required: true },
    rating: { type: RatingSchema, required: true },
    download: { type: DownloadSchema },

    dlcs: [AdditionalContentSchema],
    bonusContent: [AdditionalContentSchema],

    requirements: {
        type: Map,
        of: SystemRequirementsSchema,
    },
    publishedAt: Date,
    scheduledPublishAt: Date,
    lastPriceSync: Date,
    tagFeatures: [TagFeatureSchema],
    faqs: [GameFaqSchema],
}, {
    timestamps: true, // createdAt + updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

GameSchema.index({ status: 1 });
GameSchema.index({ tags: 1 });

GameSchema.virtual('id').get(function() {
    if (!this.gameId) return null;
    return sqids.encode([this.gameId, 1]); // Converts 1 -> "b9aX2z"
});

GameSchema.index(
    { title: "text", subtitle: "text", "metadata.publisher": "text" },
    { weights: { title: 10, subtitle: 5, "metadata.publisher": 3 } }
);

GameSchema.pre('validate', async function () {
    // Update the slug for URL
    if (this.isModified('title') || this.isModified('subtitle')) {
        this.slug = slugify(this.title, this.subtitle ?? '');
    }

})

GameSchema.pre('save', async function(){
    if (!this.isNew) return;
    // If gameId was already pre-assigned (e.g. pre-reserved), do not increment counter again
    if (this.gameId) return;

    // If doc is new without pre-reserved gameId, increase the counter
    try {
        const counter = await CounterModel.findOneAndUpdate(
            { id: 'gameId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        this.gameId = counter.seq;
    } catch (error: unknown) {
        throw error;
    }
})

// Export
export type GameDocument = InferSchemaType<typeof GameSchema> & { id: string };
export type GameCreateDocument = Omit<GameDocument, 'createdAt' | 'updatedAt' | 'slug' | 'gameId' | 'tagFeatures' | 'id' | 'publishedAt' | 'scheduledPublishAt'>;

const GameModel = mongoose.models.Game || mongoose.model("Game", GameSchema);
export default GameModel;
