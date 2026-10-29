import mongoose, { type InferSchemaType } from "mongoose";
import CounterModel from "./counter.model";
import { emailRegex, usernameRegex } from "@/lib/utils";
import { sqids } from "@/lib/sqids";

// 1. Social Link Subdocument Schema
const SocialLinkSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true,
        enum: ['twitter', 'reddit', 'twitch', 'github', 'linkedin', 'instagram', 'youtube', 'discord', 'steam']
    },
    username: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

const BannerSchema = new mongoose.Schema({
    type : {
        type : String,
        required: true,
        enum : ["image","video","color"],
        default : "color"
    },
    image: { type: String, trim: true },
    video: { type: String, trim: true },
    color: { type: String, trim: true , default: "#232323" },
}, {
    _id : false
})

const UserSettingsSchema = new mongoose.Schema({
    publicProfile: { type: Boolean, default: true },
    showActivity: { type: Boolean, default: true },
    showWishlist: { type: Boolean, default: true },
    emailNotifs: { type: Boolean, default: true },
    priceAlerts: { type: Boolean, default: true },
    commentReplyNotifs: { type: Boolean, default: false },
    autoplayTrailers: { type: Boolean, default: true },
    matureContent: { type: Boolean, default: false },
}, { _id: false });

// 2. Main Profile Schema
const UserSchema = new mongoose.Schema({
    // Mapping the TypeScript 'id' to a unique string field
    userId: {
        type: Number,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    handle: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true,
        match : [usernameRegex , 'Username must be 3-15 characters and contain only letters, numbers, or underscores']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index:true,
        match : [emailRegex , 'Invalid email structure']

    },
    password : {
        type: String,
        required:true,
    },
    role : {
        type : String,
        enum : ["admin" , "user"],
        default: "user"
    },
    avatar: {
        type: String,
        default: null
    },
    about: {
        type: String,
        default: '',
        trim: true
    },
    favoriteGames: [{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Game',
        default: []
    }],
    library: [{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Game',
        default: []
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Game',
        default: []
    }],
    socials: {
        type: [SocialLinkSchema],
        default: []
    },
    badges: [{
        type: String,
        enum: ['admin', 'moderator', 'veteran', 'seeder', 'repacker', 'cracker'],
        default: []
    }],
    stats: {
        gamesOwned: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        followers: {
            type: Number,
            default: 0,
            min: 0
        },
        following: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    banner: {type : BannerSchema},
    background: {type : String ,  trim : true},
    settings: {
        type: UserSettingsSchema,
        default: () => ({})
    },
    likedGames: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        default: []
    }],
    likedComments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: []
    }],
    warnings: [{
        reason: { type: String, required: true },
        issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    bannedAt: { type: Date, default: null }
}, {
    timestamps: true,
    versionKey: false, // Disables __v tracking if not needed
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

UserSchema.virtual('id').get(function(){
    if(!this.userId) return null
    return sqids.encode([this.userId,2]);
})


UserSchema.pre('save', async function () {

    if (!this.isNew) return;

    //if doc is new then increase the counter
    try {
        const counter = await CounterModel.findOneAndUpdate(
            { id: 'userId' },          // Find the counter tracking userIds
            { $inc: { seq: 1 } },      // Atomically increment by 1
            { new: true, upsert: true } // Create the counter tracking record if it doesn't exist yet
        );

        this.userId = counter.seq;
    } catch (error: unknown) {
        throw error;
    }
});

export type UserDocument = InferSchemaType<typeof UserSchema> & {id : string} //virtual id
const UserModel = mongoose.models.User || mongoose.model('User', UserSchema)
// Create and export the Model
export default UserModel
