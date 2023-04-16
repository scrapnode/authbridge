import * as React from "react";
import { User } from "../interfaces";

export function useUser(): [boolean, User | null] {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setUser(null);
    }, 1000);
  });

  return [loading, user];
}
