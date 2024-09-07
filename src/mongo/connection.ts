import { MONGO_URI, STAGE } from "@/env";
import mongoose from "mongoose";

if (["local", "dev"].includes(STAGE)) {
  mongoose.set("debug", true);
}

mongoose.set("autoIndex", STAGE === "local");

let connection: typeof mongoose | null = null;

export const mongoConnection = async () => {
  if (
    !connection ||
    connection.connection.readyState !== mongoose.STATES.connected
  ) {
    console.log("Creating a mongo connection.");
    connection = await mongoose.connect(MONGO_URI);
  }

  return connection;
};

mongoConnection();
