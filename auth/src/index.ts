import { db } from "./config/db";
import { app } from "./app";
import { ErrorResponse } from "@aldabil/microservice-common";

const ENVs = ["JWT_SECRET", "MONGO_URI"];

db.then(() => {
  for (const env of ENVs) {
    if (!process.env[env]) {
      throw new ErrorResponse(502, `Env ${env} is missing`);
    }
  }
  app.listen(3000, () => {
    console.log(`Listening on PORT 3000`);
  });
}).catch((err) => {
  console.log(err);
});
