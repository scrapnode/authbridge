import { project } from "./project";

export interface OpenAPI {
  bucket: {
    name: string;
  };
}

const prefix = project.name.toLowerCase();
export const openapi: OpenAPI = {
  bucket: {
    name: `${prefix}.${project.domain}`,
  },
};
