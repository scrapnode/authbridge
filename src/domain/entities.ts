export interface User {
  sub: string;
  email: string;
  name: string;
  gender?: string;
  picture?: string;
  phone_number?: string;
  attributes: UserAttributes;
}

export interface UserAttributes {
  [name: string]: string | number;
}
