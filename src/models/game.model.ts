import mongoose, { type InferSchemaType } from "mongoose";

const SystemSpecsSchema = new mongoose.Schema({
    os: { type: String, required: [true, "OS is required"] },
    cpu: { type: String, required: [true, "CPU is required"] },
    ram: { type: String, required: [true, "RAM is required"] },
    gpu: { type: String, required: [true, "GPU is required"] },
    storage: { type: String, required: [true, "Storage is required"] },
    directX: { type: String },
}, { _id: false });

const SystemRequirementsSchema = new mongoose.Schema({
    minimum: { type: SystemSpecsSchema, required: true },
    recommended: { type: SystemSpecsSchema, required: true },
}, { _id: false });

const DownloadSourceSchema = new mongoose.Schema({
    host: { type: String, required: [true, "Host is required"] },
    url: [{ type: String, required: true }],
}, { _id: false });

const DownloadSchema = new mongoose.Schema({
    base: [DownloadSourceSchema],
    update: [DownloadSourceSchema],
}, { _id: false });

const AdditionalContentSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: [true, "Title is required"] },
    image: { type: String, required: [true, "Image is required"] },
    type: { type: String },
    size : {
        type : String , 
        enum: {
            values: ["def","sqr","wide"],
            message: "{VALUE} is not a valid size",
        },
        default : "def"}
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
    engine: { type: String },
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
    logo: { type: String,  required: [true, "Logo image is required"] },
    coverImage: { type: String, required: [true, "Cover image is required"] },
    bannerImage: { type: String, required: [true, "Banner image is required"] },
    bannerImage2: { type: String },
    previewImages: [{
        src: { type: String , required : true},
        title: { type: String, required : true }
    }],
    videoLinks: [{
        src: { type: String , required : true },
        title: { type: String , required : true }
    }],
    ambientColor: {
        type: String,
        required: [true, "Ambient color is required"],
        match: [/^#[0-9A-Fa-f]{6}$/, "ambientColor must be a valid 6-digit HEX"],
    },
}, { _id: false });

const RepackSchema = new mongoose.Schema({
    based_on: [{ type: String }],
    game_version: { type: String, required: [true, "Game version is required"] },
    repack_by: { type: String },
    repack_size: { type: String, required: [true, "Repack size is required"] },
    final_size: { type: String, required: [true, "Final installed size is required"] },
    interface_language: { type: String },
    languages: { type: String },
    audio_language: { type: String },
    subtitle_language: { type: String },
    lossless_repack: { type: String },
    install_time: { type: String, required: [true, "Install time is required"] },
    crack: { type: String },
    greetings: [{ type: String }],
}, { _id: false });

const ContentTypeSchema = new mongoose.Schema({
    age: {
        type: Number,
        min: [3, "Age cannot be less than 3"],
        max: [21, "Age cannot exceed 21"],
        required : true
    },
    ageRating: {
        type: String,
        enum: {
            values: ["E", "T", "M", "AO", "PEGI 3", "PEGI 7", "PEGI 12", "PEGI 16", "PEGI 18", "IARC 3", "IARC 7", "IARC 12", "IARC 16", "IARC 18", "Unrated"],
            message: "{VALUE} is not a valid age rating",
        },
        required : true
    },
    descriptors: [{
        type: String,
        enum: {
            values: ["Blood and Gore", "Intense Violence", "Strong Language", "Sexual Themes", "Nudity", "Use of Drugs", "In-Game Purchases"],
            message: "{VALUE} is not a valid content descriptor",
        },
        required : true
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

const JSONNodeSchema = new mongoose.Schema({
    type:       { type: String, required: true },
    content:    { type: String },
    src:        { type: String },
    autoplay:   { type: Boolean , default : true },
    loop:       { type: Boolean , default : true },
    muted:      { type: Boolean , default : true },
    controls:   { type: Boolean , default : false},
    hoverPlay:  { type: Boolean , default : false},
    tapToggle:  { type: Boolean , default : true },
    href:       { type: String },
    classes:    { type: [String]},
    children:   { type: [mongoose.Schema.Types.Mixed] }
},{ _id: false });

// 2. Make the schema recursive by pointing 'children' back to itself
JSONNodeSchema.add({
    children: { type: [JSONNodeSchema], default: undefined }
});

// 3. Define the main Root Schema
const JSONRootSchema = new mongoose.Schema({
  type:     { type: String, required: true, enum: ['root'], default: 'root' },
  children: { type: [JSONNodeSchema], required: true }
},{ _id: false });

// ─── Main Game schema ─────────────────────────────────────────────────────────

const GameSchema = new mongoose.Schema({
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
    synopsis: {
        type: String,
        required: [true, "Synopsis is required"],
        minlength: [10, "Synopsis must be at least 10 characters"],
        maxlength: [400, "Synopsis must be under 400 characters"],
    },
    edition:{type : JSONRootSchema},
    description: {type : JSONRootSchema , required : true},
    status: {
        type: String,
        enum: {
            values: ["published", "draft", "delisted"],
            message: "{VALUE} is not a valid status",
        },
        required: [true, "Status is required"],
    },
    tags: [{
        type: String,
        enum: {
            values: ["new-release", "trending", "exclusive", "early-access", "featured", "coming-soon"],
            message: "{VALUE} is not a valid tag",
        },
    }],

    metadata: { type: MetadataSchema, required: true },
    visuals: { type: VisualsSchema, required: true },
    repack: { type: RepackSchema,required: true  },
    contentType: { type: ContentTypeSchema , required : true},
    rating: { type: RatingSchema, required: true },
    download: { type: DownloadSchema },

    dlcs: [AdditionalContentSchema],
    bonusContent: [AdditionalContentSchema],

    requirements: {
        type: Map,
        of: SystemRequirementsSchema,
    },
}, {
    timestamps: true, // createdAt + updatedAt
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

GameSchema.index({ title: "text", "metadata.developer": "text" , "metadata.genres": "text" });
GameSchema.index({ status: 1 });
GameSchema.index({ tags: 1 });

// Export
export type DBGameSchema = Omit<InferSchemaType<typeof GameSchema>, 'createdAt' | 'updatedAt'> & {
    _id: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};

const GameModel = mongoose.models.Game || mongoose.model("Game", GameSchema);
export default GameModel;