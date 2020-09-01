// import AWS from "aws-sdk";
// // import commonMiddleware from "../lib/commonMiddleware";
// // import createError from "http-errors";

// const dynamodb = AWS.DynamoDB.DocumentClient();
// async function processBufferItems(event, context) {
//   let bufferRecords;
//   const params = { TableName: "CoinsBufferTable" };
//   try {
//     const result = await dynamodb.scan(params).promise();
//     bufferRecords = result.Items;
//     console.log({ result });
//   } catch (error) {
//     console.log("Error encountered!");
//     console.log(error);
//     // throw new createError.InternalServerError(error);
//   }
//   //   return {
//   //     statusCode: 200,
//   //     body: JSON.stringify(users),
//   //   };
//   console.log({ bufferRecords });
// }

import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { updateUserCoins } from "./UpdateCoins";
import { sendEmail } from "./processRedemptionQueue";
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function processBufferItems(event, context) {
  let bufferRecords;
  var d1 = new Date();
  var d2 = new Date(d1);
  d2.setMinutes(d1.getMinutes() - 5);
  console.log({ d1, d2 });
  const params = {
    ExpressionAttributeValues: { ":expiry_time": d2.toISOString() },
    FilterExpression: "created_at < :expiry_time",
    TableName: "CoinsBufferTable",
  };
  try {
    const result = await dynamodb.scan(params).promise();
    bufferRecords = result.Items;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
  bufferRecords.forEach(async (record) => {
    const { user_id, coins_required, created_at, amount } = record;
    try {
      await updateUserCoins(user_id, coins_required);

      await dynamodb
        .delete({
          TableName: "CoinsBufferTable",
          Key: {
            created_at: created_at,
          },
        })
        .promise();
    } catch (error) {
      console.log("Error: ", error);
      //   const body = `Something went terribly wrong deleting buffer record : UserId: ${user_id}, CoinsRequired: ${coins_required}, CreatedAt: ${created_at}, Amount: ${amount}`;
      //   const subject = `Error deleting buffer record`;
      //   await sendEmail(subject, body);
    }
  });
  return {
    statusCode: 200,
    body: JSON.stringify(bufferRecords),
  };
}

export const handler = commonMiddleware(processBufferItems);
