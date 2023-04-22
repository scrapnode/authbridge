import * as mw from "@functions/middlewares";

export const body = mw.validator.instance.compile<any>({
  type: "object",
  required: ["refresh_token"],
  properties: {
    refresh_token: { type: "string" },
  },
});
