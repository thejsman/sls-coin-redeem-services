// import createError from "http-errors";
import { sendEmailToAdmin } from "./sendMail";
import axios from "axios";
import { API_End_Point, processTransaction } from "../lib/utils";

async function processRedemptionQueue(event, context) {
  try {
    const record = event.Records[0];
    const { user_id, item_id, amount } = await JSON.parse(record.body);

    // fetch item info via api
    const item = await axios.get(`${API_End_Point}/getItemsById/${item_id}`);

    const { status } = item.data;
    //Inventory response
    if (status) {
      const { item_info } = item.data;

      if (item_info.inventory > 0) {
        await processTransaction(item_info, user_id, amount);
      } else {
        //No Inventory - send refund email
        const body = `Hello Admin, Item Id: ${item_id} is no longer available please, initiate refund for UserId: ${user_id} Amount deducted :${amount}.`;
        const subject = `Initiate Refund UserId: ${user_id}, ItemId: ${item_id}, Amount: ${amount}`;
        await sendEmailToAdmin(subject, body);
        // throw new createError.Forbidden("No Inventory");
      }
    } else {
      console.log("Item does not exist");
    }
  } catch (error) {
    console.log("Error fetching api: ", error);
  }
}

export const handler = processRedemptionQueue;
