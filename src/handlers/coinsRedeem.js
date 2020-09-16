import AWS from "aws-sdk";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import coinsRedeemSchema from "../lib/schemas/coinsRedeemSchema";

// import createError from "http-errors" // to handle errors from checkInventory endpoints
import { getUserById } from "./getUser";

const sqs = new AWS.SQS({ region: "ap-south-1" });

async function coinsRedeem(event, context) {
  const { user_id } = event.body;

  //get user by id to validate user
  const user = await getUserById(user_id);

  //verify if user object is valid

  if (user) {
    // write on SQS fifo queue

    await sqs
      .sendMessage({
        QueueUrl:
          "https://sqs.ap-south-1.amazonaws.com/375647459438/CoinsRedemptionQueue.fifo",
        MessageBody: JSON.stringify(event.body),
        MessageGroupId: "coin-123",
      })
      .promise();
  }

  const record = JSON.stringify({
    success: 1,
    message: "Record successfully placed on SQS",
    user,
  });

  return {
    statusCode: 200,
    body: record,
  };
}

export const handler = commonMiddleware(coinsRedeem).use(
  validator({ inputSchema: coinsRedeemSchema })
);
