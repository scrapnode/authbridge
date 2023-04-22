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
