import mongoose, { type InferSchemaType } from "mongoose";

const MetricSchema = new mongoose.Schema(
    {
        date: {
            type: String, // "YYYY-MM-DD"
            required: true,
            unique: true,
            index: true,
        },
        visits: {
            type: Number,
            default: 0,
        },
        uniqueVisitors: {
            type: Number,
            default: 0,
        },
        discussions: {
            type: Number,
            default: 0,
        },
        wishlistAdds: {
            type: Number,
            default: 0,
        },
        downloadClicks: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export type DBMetric = InferSchemaType<typeof MetricSchema> & {
    _id: mongoose.Types.ObjectId;
};

const MetricModel = mongoose.models.Metric || mongoose.model("Metric", MetricSchema);
export default MetricModel;
