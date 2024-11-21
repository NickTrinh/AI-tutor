import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      throw err;
    });
}

export default clientPromise;