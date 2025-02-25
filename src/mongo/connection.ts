import { MONGO_URI } from '@/env';
import mongoose from 'mongoose';

const isProd = process.env.NODE_ENV === 'production';

mongoose.set('debug', !isProd);
mongoose.set('autoIndex', !isProd);

let connection: typeof mongoose | null = null;

export const mongoConnection = async () => {
  if (
    !connection ||
    connection.connection.readyState !== mongoose.STATES.connected
  ) {
    console.log('Creating a mongo connection.');
    connection = await mongoose.connect(MONGO_URI);
    console.log('Mongo connection created.');
  }

  return connection;
};

mongoConnection();
