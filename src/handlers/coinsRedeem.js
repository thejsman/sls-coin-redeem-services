import commonMiddleware from "../lib/commonMiddleware";
// import createError from "http-errors" // to handle errors from checkInventory endpoints
import { getUserById } from "./getUser";

async function coinsRedeem(event, context) {
  const { user_id } = event.body;

  //get user by id to validate user
  const user = await getUserById(user_id);

  //verify if user object is valid

  if (user) {
    // write on SQS fifo queue
  }

  const body = event.body;
  console.log({ body });

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
}

export const handler = commonMiddleware(coinsRedeem);
