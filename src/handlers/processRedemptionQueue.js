import createError from "http-errors";
import { sendEmailToAdmin } from "./sendMail";
import axios from "axios";
import { API_EndPoint, processTransaction } from "../lib/utils";

async function processRedemptionQueue(event, context) {
  const record = event.Records[0];
  const { user_id, item_id, amount } = JSON.parse(record.body);
  let item_info = {};

  try {
    // fetch item info via api
    const item = await axios.get(`${API_EndPoint}/getItemsById/${item_id}`);
    //Inventory response
    item_info = {
      ...item.data.item_info,
    };

    if (item_info.inventory > 0) {
      await processTransaction(item_info, user_id, amount);
    } else {
      //No Inventory - send refund email
      const body = `Hello Admin, Item Id: ${item_id} is no longer available please, initiate refund for UserId: ${user_id} Amount deducted :${amount}.`;
      const subject = `Initiate Refund UserId: ${user_id}, ItemId: ${item_id}, Amount: ${amount}`;
      await sendEmailToAdmin(subject, body);
      throw new createError.Forbidden("No Inventory");
    }
  } catch (error) {
    console.log(error);
    const body = `Something went terribly wrong in fetching the Item inventory API for item id: ${item_id}, amount: ${amount}, user id: ${user_id}, please check.`;
    const subject = `Error in fetching inventory API`;
    await sendEmailToAdmin(subject, body);
    throw new createError.Forbidden("Could not fetch the item info");
  }
}

export const handler = processRedemptionQueue;
