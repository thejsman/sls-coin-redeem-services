import AWS from "aws-sdk";
import createError from "http-errors";
import { updateUserCoins } from "./UpdateCoins";
import { getUserById } from "./getUser";
import { sendEmailToAdmin } from "./sendMail";
import { v4 as uuid } from "uuid";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function processRedemptionQueue(event, context) {
  const record = event.Records[0];
  const { user_id, item_id, amount, inventory } = JSON.parse(record.body);

  // fetch item info via api

  // suppose you received a response from the API for the item_id: 123
  const item_info = {
    item_id: "1234",
    inventory,
    coins_required: 10,
    currency_required: 0,
  };

  if (item_info.inventory > 0) {
    //
    try {
      //check if user have enought coins
      const user = await getUserById(user_id);

      //check coin and amount condition
      if (
        user.total_coins >= item_info.coins_required &&
        amount === item_info.currency_required
      ) {
        // API call for inventory checkout
        //
        //
        //
        //
        //
        // API Checkout request End and return +ive

        // put the record on the buffer table
        const now = new Date();
        const bufferRecord = {
          user_id,
          item_id,
          coins_required: item_info.coins_required,
          amount,
          created_at: now.toISOString(),
        };

        const params = {
          TableName: "BufferCoinsTable",
          Item: bufferRecord,
        };

        await dynamodb.put(params).promise();

        // deduct user coins from usersTable
        const result = await updateUserCoins(
          user_id,
          parseFloat(-item_info.coins_required)
        );
        console.log({ result });

        // remove from buffer and add to persistant table
        await dynamodb
          .delete({
            TableName: "BufferCoinsTable",
            Key: {
              user_id: user_id,
            },
          })
          .promise();

        const coins_params = {
          TableName: "CoinsTable",
          Item: { ...bufferRecord, id: uuid(), created_at: now.toISOString() },
        };
        await dynamodb.put(coins_params).promise();
      }
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }
  } else {
    //send refund email
    const message = {
      Body: {
        Text: {
          Data: `Hello Admin, Item Id: ${item_id} is no longer available please, initiate refund for UserId: ${user_id} Coins deducted :${item_info.coins_required}.`,
        },
      },
      Subject: {
        Data: `Initiate Refund UserId: ${user_id}, ItemId: ${item_id}, Coins: ${item_info.coins_required}`,
      },
    };
    await sendEmailToAdmin(message);
    console.log("Not enought coins");
    // throw new createError.Forbidden("Not enought coins");
  }
}

export const handler = processRedemptionQueue;
