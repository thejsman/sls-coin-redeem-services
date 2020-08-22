import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import coinsRedeemSchema from "../lib/schemas/coinsRedeemSchema";

// import createError from "http-errors" // to handle errors from checkInventory endpoints
import { getUserById } from "./getUser";

async function coinsRedeem(event, context) {
  const { user_id, item_id, amount = 0 } = event.body;

  //get user by id to validate user
  const user = await getUserById(user_id);

  //verify if user object is valid

  if (user) {
    // write on SQS fifo queue

    console.log({ user_id, item_id, amount });
  }

  const body = event.body;
  console.log({ body });

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
}

export const handler = commonMiddleware(coinsRedeem).use(
  validator({ inputSchema: coinsRedeemSchema })
);
