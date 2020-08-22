import AWS from "aws-sdk";
import validator from "@middy/validator";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import createUserSchema from "../lib/schemas/createUserSchema";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createUser(event, context) {
  const { user_id, total_coins } = event.body;
  const now = new Date();

  const user = {
    user_id,
    total_coins,
    created_at: now.toISOString(),
  };
  try {
    await dynamodb
      .put({
        TableName: "UsersTable",
        Item: user,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 201,
    body: JSON.stringify(user),
  };
}

export const handler = commonMiddleware(createUser).use(
  validator({ inputSchema: createUserSchema })
);
