import account from "./account";
import auth from "./auth";
import cognito from "./cognito";
import dev from "./dev";

export default {
  ...account,
  ...auth,
  ...cognito,
  ...dev,
};
