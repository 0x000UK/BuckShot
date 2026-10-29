import mongoose, { Schema, type InferSchemaType } from "mongoose";

const DownloadClickSchema = new Schema(
    {
        gameId: {
            type: String,
            required: true,
            index: true,
        },
        gameTitle: {
            type: String,
            required: true,
            trim: true,
        },
        siteName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },
        linkType: {
            type: String,
            enum: ["official", "non-official"],
            default: "non-official",
            index: true,
        },
        category: {
            type: String,
            default: "Direct",
            trim: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
            default: null,
        },
        userHandle: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

DownloadClickSchema.index({ siteName: 1, createdAt: -1 });
DownloadClickSchema.index({ gameId: 1, createdAt: -1 });
DownloadClickSchema.index({ linkType: 1, createdAt: -1 });

export type DBDownloadClick = InferSchemaType<typeof DownloadClickSchema> & {
    _id: mongoose.Types.ObjectId;
};

const DownloadClickModel = mongoose.models.DownloadClick || mongoose.model("DownloadClick", DownloadClickSchema);
export default DownloadClickModel;
