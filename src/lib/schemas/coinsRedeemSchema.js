const schema = {
  properties: {
    body: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
        },
        item_id: {
          type: "string",
        },
        amount: {
          type: "number",
        },
      },
      required: ["user_id", "item_id"],
    },
  },
  required: ["body"],
};

export default schema;
