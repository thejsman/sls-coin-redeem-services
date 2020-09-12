import AWS from "aws-sdk";
const ses = new AWS.SES({ region: "ap-south-1" });

export const sendEmailToAdmin = async (subject, body) => {
  const params = {
    Source: "Sagoon <niranjan.bhambi@gmail.com>",
    Destination: {
      ToAddresses: ["niranjan.b@keydisruptors.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
      },
    },
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
  const subject = "Refund Email - Template";
  const body = "Hello from Coins Redemption service! Refund email body";

  //send email
  await sendEmailToAdmin(subject, body);
}

export const handler = sendMail;
