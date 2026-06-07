import mongoose, { Document} from "mongoose";

// 1. Create User type

/* 
    mongodb schema has other properties like id , timestamps etc
    we need to include those too, in our type or else later it would cause type mismatch problems
    Extend with mongoose Documents where all these types are defined 
*/
interface IUser extends Document {
    name : string,
    email : string,
    password : string,
    role? : string,
    badge? : string[]
    createdAt : Date
    updatedAt: Date
}

// 2. create schema based on defined type

/*  param 1 = definition of schema object
    param 2 = options like timestamp , createdAt etc...
    Since its typescript we need a type for our Schema */
const userSchema = new mongoose.Schema<IUser>({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ["user", "admin"],
        default : "user"
    },
    badge : [{
        type : String
    }]
},
{
    timestamps : true
}) 


// 3. Now make actual model with the Schema and give it a name

// If model already exist in memory (models array) then take it or create a new one
const UserModel = mongoose.models.User || mongoose.model("User", userSchema)

// 4. export it as default
export default UserModel