import mongoose from "mongoose";

const ContentTypeSchema = new mongoose.Schema({
    age: { type: Number },
    ageRating: {
        type: String,
        enum: ["E", "T", "M", "AO", "PEGI 3", "IARC 3", "IARC 7", "IARC 12", "IARC 16", "IARC 18", "PEGI 7", "PEGI 12", "PEGI 16", "PEGI 18", "Unrated"]
    },
    descriptors: [{
        type: String,
        enum: ["Blood and Gore", "Intense Violence", "Strong Language", "Sexual Themes", "Nudity", "Use of Drugs", "In-Game Purchases"]
    }]
}, { _id: false });

const SystemSpecsSchema = new mongoose.Schema({
    os: { type: String, required: true },
    cpu: { type: String, required: true },
    ram: { type: String, required: true },
    gpu: { type: String, required: true },
    storage: { type: String, required: true },
    directX: { type: String }
}, { _id: false });

const SystemRequirementsSchema = new mongoose.Schema({
    minimum: { type: SystemSpecsSchema, required: true },
    recommended: { type: SystemSpecsSchema, required: true }
}, { _id: false });

const DownloadSourceSchema = new mongoose.Schema({
    host: { type: String, required: true },
    url: [{ type: String, required: true }],
    bgimg: { type: String }
}, { _id: false });

const DownloadTypeSchema = new mongoose.Schema({
    base: [DownloadSourceSchema],
    update: [DownloadSourceSchema]
}, { _id: false });

const MetaDataSchema = new mongoose.Schema({
    developer: { type: String },
    publisher: { type: String },
    franchise: { type: String },
    releaseDate: { type: Date },
    genres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Genre"
    }],
    engine: { type: String },
    version: { type: String },
    platforms: [{
        type: String,
        enum: ["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch", "macOS", "Linux"]
    }]
}, { _id: false });

const RepackInfoSchema = new mongoose.Schema({
    based_on: [{ type: String }],
    game_version: { type: String },
    repack_size: { type: String },
    final_size: { type: String },
    interface_language: { type: String },
    languages: { type: String },
    audio: { type: String },
    subtitle: { type: String },
    lossless_repack: { type: String },
    install_time: { type: String },
    crack: { type: String },
    greetings: [{ type: String }],
    repack_by: { type: String }
}, { _id: false });

const GameRatingSchema = new mongoose.Schema({
    score: { type: Number, required: true },
    maxScore: { type: Number },
    reviewCount: { type: Number }
}, { _id: false });

const AdditionalContentSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    type: { type: String } // Allows your strict string options or any general string
}, { _id: false });

const VisualAssetSchema = new mongoose.Schema({
    logo: { type: String },
    coverImage: { type: String },
    bannerImage: { type: String },
    previewImages: [{ type: String }],
    videoLinks: [{ type: String }],
    ambientColor: { type: String }
}, { _id: false });

// ==========================================
// 2. MAIN GAME SCHEMA
// ==========================================

const GameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    metadata: MetaDataSchema,
    repack: RepackInfoSchema,
    visuals: VisualAssetSchema,
    status : {
        type : String,
        enum : ["Published", "Draft", "Delisted"]
    },

    tags: [{
        type: String,
        enum: ["new-release", "trending", "exclusive", "early-access", "featured", "coming-soon"]
    }],

    rating: GameRatingSchema,
    contentType: ContentTypeSchema,
    bonusContent: [AdditionalContentSchema],
    dlcs: [AdditionalContentSchema],

    // Storing requirements as a Map handles your dynamic GamePlatform keys perfectly
    requirements: {
        type: Map,
        of: SystemRequirementsSchema
    },

    download: DownloadTypeSchema
}, {
    timestamps: true
});

// 3. EXPORT THE MODEL
const GameModel = mongoose.models.Game || mongoose.model('Game', GameSchema);
export default GameModel;
