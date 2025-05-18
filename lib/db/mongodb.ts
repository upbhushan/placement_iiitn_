import mongoose from 'mongoose';

// Declare a type for the mongoose property on the global object
declare global {
  var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("⚠️ MONGODB_URI is missing in .env.local");
// Cached connection
let cached = global.mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB
 * @returns A promise that resolves to a Mongoose connection
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
        bufferCommands: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Give up initial connection after 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('Disconnected from MongoDB');
  }
}