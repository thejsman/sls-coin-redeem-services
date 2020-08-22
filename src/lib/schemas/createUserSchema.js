const schema = {
  properties: {
    body: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
        },
        total_coins: {
          type: "number",
        },
      },
      required: ["user_id", "total_coins"],
    },
  },
  required: ["body"],
};

export default schema;
