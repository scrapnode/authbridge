import get from "./get";
import update from "./update";
import password from "./password";

export default {
  "me-get": get,
  "me-update": update,
  ...password,
};
