import * as mw from "@functions/middlewares";

export const headers = mw.validator.instance.compile<any>({
  type: "object",
  required: ["authorization"],
  properties: {
    authorization: { type: "string" },
  },
});

export const body = mw.validator.instance.compile<any>({
  type: "object",
  required: ["previous_password", "proposed_password"],
  properties: {
    previous_password: { type: "string", format: "password" },
    proposed_password: { type: "string", format: "password" },
  },
});
