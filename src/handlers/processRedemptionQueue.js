async function processRedemptionQueue(event, context) {
  console.log("Processing a queue");
  const record = event.Records[0];
  const { user_id, item_id, amout } = JSON.parse(record.body);

  // fetch item info via api

  // if all api return +ve

  // else api returns -ve

  //right now just console
  console.log({ user_id, item_id, amout });
}

export const handler = processRedemptionQueue;
