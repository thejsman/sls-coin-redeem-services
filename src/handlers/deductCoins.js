import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const getUserById = async (user_id) => {
  let user;
  try {
    const result = await dynamodb
      .get({
        TableName: "UsersTable",
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
  return user;
};

async function deductCoins(event, context) {
  const { user_id } = event.pathParameters;
  const { coins } = event.body;

  const user = await getUserById(user_id);
  let updatedUser;
  if (user) {
    const total_coins = user.total_coins - coins;
    console.log({ total_coins });
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
      updatedUser = result.Attributes;
    } catch (error) {
      throw new createError.InternalServerError(error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedUser),
  };
}

export const handler = commonMiddleware(deductCoins);
