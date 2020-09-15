import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { updateUserCoins } from "./UpdateCoins";
import axios from "axios";
import { API_End_Point } from "../lib/utils";
import { sendEmailToAdmin } from "./sendMail";

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
    const { user_id, coins_required, created_at, item_id } = record;
    try {
      //Reverse the inventory
      await axios.patch(`${API_End_Point}/revertInventory`, {
        item_id,
        user_id,
      });
      //Reverse the user coins
      await updateUserCoins(user_id, coins_required);

      //Delete the buffer record
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
      const body = `Something went wrong deleting buffer record : UserId: ${user_id}, ItemId: ${item_id}, CreatedAt: ${created_at}`;
      const subject = `Error deleting buffer record`;
      await sendEmailToAdmin(subject, body);
    }
  });
  return {
    statusCode: 200,
    body: JSON.stringify(bufferRecords),
  };
}

export const handler = commonMiddleware(processBufferItems);
