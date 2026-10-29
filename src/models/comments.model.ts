import mongoose, { type InferSchemaType } from "mongoose";

const CommentSchema = new mongoose.Schema({
    gameId : {
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Game', 
    },
    parentId : {
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'Comment',
        default : null
    },
    author : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title : String,
    content : {
        type : String,
        required : true,
    },
    upvotes: Number,
    downvotes : Number,
    totalReplies : Number,
    pinned : Boolean
},{
    timestamps: true,
})

export type DBComment = InferSchemaType<typeof CommentSchema>

CommentSchema.index({ gameId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });

const CommentModel = mongoose.models.Comment || mongoose.model("Comment",CommentSchema);
export default CommentModel

