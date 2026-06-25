import mongoose, { type InferSchemaType } from "mongoose"

const GenreSchema = new mongoose.Schema({
    name : {
        type  :String,
        required : true
    },
    slug : {
        type :String,
        required : true
    },
    gameCount : {
        type : Number,
        required : true,
        default : 0
    }
}, {
    timestamps : true
})

const GenreModel = mongoose.models.Genre || mongoose.model("Genre",GenreSchema )

export type DBGenreSchema = InferSchemaType<typeof GenreSchema> & {
    _id: mongoose.Types.ObjectId,
    createdAt?: Date;
}

export default GenreModel