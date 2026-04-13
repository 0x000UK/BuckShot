import mongoose from "mongoose";

const mongodb_uri = process.env.MONGODB_URL

if(!mongodb_uri){
    throw new Error("db url not found!")
}

/*
    By default, Next.js routes (especially when hosted on platforms like Vercel) run as Serverless Functions. These are "ephemeral," meaning they wake up to handle a request and go back to sleep afterward. 

    The Potential Issue: If you write await client.connect() inside your function, 
        every single visitor triggers a brand-new connection process, 
        which is slow (adding ~100ms+ latency) and can quickly hit MongoDB's connection limits.
        
    The Solution (Caching): Professional Next.js setups use a global variable to "cache" the connection. 
        If the serverless function is still "warm" from a previous visitor, 
        it reuses the existing connection instead of making a new one. 
*/

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
        cached.promise = mongoose.connect(mongodb_uri!).then((m)=>m.connection)
    }

    // wait for the promise to resolve and store the connection
    cached.conn = await cached.promise
    return cached.conn
}