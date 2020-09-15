import AWS from "aws-sdk";
import createError from "http-errors";
import { updateUserCoins } from "../handlers/UpdateCoins";
import { getUserById } from "../handlers/getUser";
import { v4 as uuid } from "uuid";
import { sendEmailToAdmin } from "../handlers/sendMail";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const API_End_Point = "https://dev.sagoon.com/Public";

// funciton to update inventory,
export const processTransaction = async (item, user_id, amount) => {
  const now = new Date();

  try {
    //check user exists
    const user = await getUserById(user_id);

    //check coin and amount condition
    if (amount === parseInt(item.currency_required)) {
      console.log("Amount match");
      // API call for inventory checkout
      //
      //
      //
      //
      //
      // API Checkout request End and return +ive
      console.log("will call update inventory call");

      // put the record on the buffer table
      const bufferRecord = {
        user_id,
        item_id: item.item_id,
        coins_required: parseInt(item.coin),
        amount,
        created_at: now.toISOString(),
      };
      const params = {
        TableName: "CoinsBufferTable",
        Item: bufferRecord,
      };

      await dynamodb.put(params).promise();

      if (user.total_coins >= parseInt(item.coin)) {
        // deduct coins from user table
        try {
          await updateUserCoins(user_id, parseInt(-item.coin));

          // remove from buffer and add to persistant table
          await dynamodb
            .delete({
              TableName: "CoinsBufferTable",
              Key: {
                created_at: now.toISOString(),
              },
            })
            .promise();

          const coins_params = {
            TableName: "CoinsTable",
            Item: {
              ...bufferRecord,
              id: uuid(),
              created_at: now.toISOString(),
            },
          };
          await dynamodb.put(coins_params).promise();
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("coins mismatch");
      }
    } else {
      const body = `Hello Admin, Amount mismatch for Item Id: ${item.item_id}, UserId: ${user_id} Amount :${amount}.`;
      const subject = `Amount mismatch: UserId: ${user_id}, ItemId: ${item.item_id}, Amount: ${amount}`;
      await sendEmailToAdmin(subject, body);
      // throw new createError.Forbidden("Amount mismatch");
    }
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
};
