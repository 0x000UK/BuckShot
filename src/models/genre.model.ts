import mongoose from "mongoose"

interface IGenre {
    name : String
    slug : String
    gameCount : number
    createdAt : Date
    updatedAt: Date
}

const GenreSchema = new mongoose.Schema<IGenre>({
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

export default GenreModel