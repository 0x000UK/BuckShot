import connectDB from "@/lib/mongodb";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const handler = NextAuth({
    providers : [
        Credentials({
            credentials : {
                email : {
                    type : "email",
                    label : "Email",
                    placeholder : "Youremail@email.com"
                },
                password : {
                    type : "password",
                    label : "Password",
                    placeholder : "******"
                }
            },
            authorize :  async (credentials) => {
                if (!credentials.email || !credentials.password) {
                    throw Error ("Missing credentials")
                }

                await connectDB()

                // find if user exist
                const user = await UserModel.findOne({email : credentials.email})

                if(!user) {
                    throw Error("User does not exist")
                }

                const passmatch =  bcrypt.compare(credentials.password.toString() , user.password)

                if(!passmatch) {
                    throw Error("Incorrect Password")
                }

                return user

            },

        })
        // other credential provider like google , github , discord etc
    ],
    callbacks : {
        jwt : async ({token, user}) => {
            token.name = user.name
            token.id = user.id
            token.email = user.email

            return token
        },

        session : async ({session , token}) => {
            session.user.name =  token.name as string
            session.user.id =    token.id as string
            session.user.email = token.email as string

            return session
        }
    },
    session :{
        strategy : "jwt",
        maxAge : 7*24*60*60 // 7 days
    },
    secret : process.env.AUTH_SECRET
})

export {handler as GET, handler as POST}