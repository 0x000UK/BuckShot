import mongoose, { type InferSchemaType } from "mongoose"

const GenreSchema = new mongoose.Schema({
    name : {
        type  :String,
        required : true,
        unique : true
    },
    slug : {
        type :String,
        required : true,
        unique : true
    },
    gameCount : {
        type : Number,
        required : true,
        default : 0
    },
    image : {
        type : String
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