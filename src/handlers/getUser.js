import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getUser(event, context) {
  let user;
  const { user_id } = event.pathParameters;
  try {
    const result = await dynamodb
      .get({
        TableName: "CoinsTable",
        Key: { user_id },
      })
      .promise();

    user = result.Item;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  if (!user) {
    throw new createError.NotFound(`User not found with ${user_id} id`);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
}

export const handler = commonMiddleware(getUser);
