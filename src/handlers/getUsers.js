import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getUsers(event, context) {
  let users;

  try {
    const result = await dynamodb.scan({ TableName: "CoinsTable" }).promise();
    users = result.Items;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(users),
  };
}

export const handler = commonMiddleware(getUsers);
