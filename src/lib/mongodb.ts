import dns from "node:dns"
dns.setServers(['1.1.1.1', '8.8.8.8']); //cloudflare , google
dns.setDefaultResultOrder('ipv4first');


import mongoose, { MongooseError } from "mongoose";

const mongodb_uri = process.env.MONGODB_URL

if(!mongodb_uri){
    throw new Error("MongoDB connection URL not found")
}

// Check if we already have a connection in the global cache
let cached = global.mongodbConnection

// if it doesn't exist yet (first time is loaded), initialize it
if(!cached) {
    cached = global.mongodbConnection = {conn : null, promise : null}
}

export default async function connectDB(){

    if(cached.conn) return cached.conn; // Return existing conection
    if(!cached.promise){
        // Start the connection process and store the PROMISE
        cached.promise = mongoose.connect(mongodb_uri!,{
            family: 4, 
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        }).then((m)=>m.connection)
    }

    // wait for the promise to resolve and store the connection
    try {
        cached.conn = await cached.promise
    }
    catch(error : any) {
        cached.promise = null;
        cached.conn = null;
        throw new MongooseError('MongoDB connection promise failed to resolve')
    }
    return cached.conn
}