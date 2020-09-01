import AWS from "aws-sdk";
import createError from "http-errors";
import { updateUserCoins } from "./UpdateCoins";
import { getUserById } from "./getUser";
import { sendEmailToAdmin } from "./sendMail";
import { v4 as uuid } from "uuid";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const sendEmail = async (subject, body) => {
  const message = {
    Body: {
      Text: {
        Data: body,
      },
    },
    Subject: {
      Data: subject,
    },
  };

  try {
    await sendEmailToAdmin(message);
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(
      "Something went wrong in sending email"
    );
  }
};

async function processRedemptionQueue(event, context) {
  const record = event.Records[0];
  const { user_id, item_id, amount, inventory } = JSON.parse(record.body);
  let item_info = {};
  const now = new Date();

  try {
    // fetch item info via api

    // suppose you received a response from the API for the item_id: 123

    item_info = {
      item_id: "1234",
      inventory,
      coins_required: 10,
      currency_required: 10,
    };
  } catch (error) {
    console.log(error);
    // send email , check amout > 0 then send email to admin
    const body = `Something went terribly wrong in fetching the Item inventory API for item id: ${item_id}, amount: ${amount}, user id: ${user_id}, please check.`;
    const subject = `Error in fetching inventory API`;
    await sendEmail(subject, body);

    throw new createError.Forbidden("Could not fetch the item info");
  }

  if (item_info.inventory > 0) {
    try {
      //check user exists
      const user = await getUserById(user_id);

      //check coin and amount condition
      if (amount === item_info.currency_required) {
        // API call for inventory checkout
        //
        //
        //
        //
        //
        // API Checkout request End and return +ive

        // put the record on the buffer table
        const bufferRecord = {
          user_id,
          item_id,
          coins_required: item_info.coins_required,
          amount,
          created_at: now.toISOString(),
        };
        const params = {
          TableName: "CoinsBufferTable",
          Item: bufferRecord,
        };

        await dynamodb.put(params).promise();

        if (user.total_coins >= item_info.coins_required) {
          // deduct coins from user table
          try {
            const result = await updateUserCoins(
              user_id,
              parseFloat(-item_info.coins_required)
            );
            console.log({ result });

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
        }
      }
    } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
    }
  } else {
    //send refund email
    if (amount > 0) {
      const body = `Hello Admin, Item Id: ${item_id} is no longer available please, initiate refund for UserId: ${user_id} Amount deducted :${amount}.`;
      const subject = `Initiate Refund UserId: ${user_id}, ItemId: ${item_id}, Amount: ${amount}`;
      await sendEmail(subject, body);
      console.log("Not enought coins");
    }

    // throw new createError.Forbidden("Not enought coins");
  }
}

export const handler = processRedemptionQueue;
