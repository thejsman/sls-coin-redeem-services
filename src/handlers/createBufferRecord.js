import AWS from "aws-sdk";

import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createBufferRecord(event, context) {
  const { user_id, item_id, coins_required, amount } = event.body;

  const now = new Date();

  const record = {
    user_id,
    item_id,
    coins_required,
    amount,
    created_at: now.toISOString(),
  };
  try {
    await dynamodb
      .put({
        TableName: "BufferCoinsTable",
        Item: record,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 201,
    body: JSON.stringify(record),
  };
}

export const handler = commonMiddleware(createBufferRecord);
