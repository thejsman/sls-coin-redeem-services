import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

import { getUserById } from "./getUser";

const dynamodb = new AWS.DynamoDB.DocumentClient();

//export a generic function to deduct coins
// user_id = id of the user
// coins = +ve OR -ve number

export const updateUserCoins = async (user_id, coins = 0) => {
  const user = await getUserById(user_id);

  if (user) {
    const total_coins = parseInt(user.total_coins) + parseInt(coins);

    // params for query
    const params = {
      TableName: "UsersTable",
      Key: { user_id },
      UpdateExpression: "set total_coins = :total_coins",
      ExpressionAttributeValues: {
        ":total_coins": total_coins,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const result = await dynamodb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      throw new createError.InternalServerError(error);
    }
  }
};

async function UpdateCoins(event, context) {
  const { user_id } = event.pathParameters;
  const { coins } = event.body;

  const updatedUser = await updateUserCoins(user_id, coins);

  return {
    statusCode: 200,
    body: JSON.stringify(updatedUser),
  };
}

export const handler = commonMiddleware(UpdateCoins);
