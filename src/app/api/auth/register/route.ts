import connectDB from "@/lib/mongodb";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest) {
    try {
        
        // 1. extract name, email , password from frontend
        const {name, email, password }  = await req.json()
        // 2. connect DB
        await connectDB()
        // 3. check if user exist in the DB
        let user = await UserModel.findOne({email : email})
        if(user) {
            return NextResponse.json(
                {message : 'Email already exist'},
                {status : 400}
            )
        }
        if ( password.length < 6) {
            return NextResponse.json(
                {message : 'Password must be atleast 6 characters long'},
                {status : 400}
            )
        }
        const hashedpass = await bcrypt.hash(password , 10)
        // 4. If not then create user and save
        user = await UserModel.create(
            {
                name,
                email,
                password : hashedpass
            }
        )
        // 4. return response with status code
        return NextResponse.json(
            {message : 'User created Successfuly'},
            {status : 201}
        )
    } catch (error) {
        return NextResponse.json(
            {message : `Internal Server Error , error : ${error}`},
            {status : 500}
        )
    }
}