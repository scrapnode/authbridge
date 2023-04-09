export interface User {
  sub: string;
  email: string;
  name: string;
  enabled: boolean;
  status: string;
  created_at: Date;
  updated_at: Date;
  gender?: string;
  picture?: string;
  phone_number?: string;
  attributes: UserAttributes;
}

export interface UserAttributes {
  [name: string]: string | number;
}

export const schema = {
  password: { type: "string", minLength: 6 },
  email: { type: "string", format: "email" },
  name: { type: "string", minLength: 1 },
  gender: { type: "string" },
  picture: { type: "string" },
  phone_number: { type: "string" },
};
