import AWS from "aws-sdk";
const ses = new AWS.SES({ region: "ap-south-1" });

export const sendEmailToAdmin = async (message) => {
  const params = {
    Source: "Sagoon <niranjan.bhambi@gmail.com>",
    Destination: {
      ToAddresses: ["niranjan.b@keydisruptors.com"],
    },
    Message: { ...message },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

async function sendMail(event, context) {
  const message = {
    Body: {
      Text: {
        Data: "Hello from Coins Redemption service! Refund email body",
      },
    },
    Subject: {
      Data: "Refund Email - Template",
    },
  };

  await sendEmailToAdmin(message);
}

export const handler = sendMail;
