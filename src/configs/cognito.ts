import { project } from "@configs/project";

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

export const cognito: Cognito = {
  region: project.region,
  pool: {
    id: process.env.COGNITO_POOL_ID || "",
    name: `${project.name}-accounts`,
  },
  client: {
    id: process.env.COGNITO_CLIENT_ID || "",
    name: `${project.name}-default`,
  },
  domain: {
    name: `${project.name}-accounts`,
    url: `https://${project.name}-accounts.auth.${project.region}.amazoncognito.com`,
  },
};
