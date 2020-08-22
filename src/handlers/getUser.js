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

async function getUser(event, context) {
  const { user_id } = event.pathParameters;
  const user = await getUserById(user_id);
  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
}

export const handler = commonMiddleware(getUser);
