import { project } from "./project";

export interface Cognito {
  region: string;
  pool: {
    id: string;
    name: string;
  };
  client: {
    id: string;
    name: string;
  };
  domain: {
    name: string;
    url: string;
  };
}

const prefix = project.name.toLowerCase();
export const cognito: Cognito = {
  region: project.region,
  pool: {
    id: process.env.COGNITO_POOL_ID || "",
    name: `${prefix}-accounts`,
  },
  client: {
    id: process.env.COGNITO_CLIENT_ID || "",
    name: `${prefix}-default`,
  },
  domain: {
    name: `${prefix}-accounts`,
    url: `https://${prefix}-accounts.auth.${project.region}.amazoncognito.com`,
  },
};
