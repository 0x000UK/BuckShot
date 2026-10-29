import mongoose  from "mongoose";
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');
try {
    if (process.env.DNS_SERVERS) {
        dns.setServers(process.env.DNS_SERVERS.split(','));
    } else {
        dns.setServers(["1.1.1.1", "1.0.0.1"]);
    }
} catch {
    // Graceful fallback to default system DNS
}


const mongodb_uri = process.env.MONGODB_URI

if(!mongodb_uri){
    throw new Error("MongoDB connection URL not found")
}

// Check if we already have a connection in the global cache
let cached = global.mongoose

// if it doesn't exist yet (first time is loaded), initialize it
if(!cached) {
    cached = global.mongoose = {conn : null, promise : null}
}

export default async function connectDB(){

    if(cached.conn) return cached.conn; // Return existing conection
    if(!cached.promise){

        cached.promise = mongoose.connect(mongodb_uri!,{
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS : 20000,
            socketTimeoutMS: 45000,
            bufferCommands : false
        }).then((m)=>{
            return m.connection
        })
    }

    // wait for the promise to resolve and store the connection
    try {
        cached.conn = await cached.promise
    }
    catch(error: unknown) {
        cached.promise = null;
        cached.conn = null;
        throw error
    }
    return cached.conn
}