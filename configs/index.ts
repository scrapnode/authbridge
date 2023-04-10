import { Project, project } from "./project";
import { Cognito, cognito } from "./cognito";
import { OpenAPI, openapi } from "./openapi";

export interface Configs {
  project: Project;
  cognito: Cognito;
  openapi: OpenAPI;
}

const configs: Configs = {
  project,
  cognito,
  openapi,
};

export default configs;

if (!configs.project.domain)
  throw new Error(
    "PROJECT_DOMAIN must be set. Ex: PROJECT_DOMAIN=scrapnode.com"
  );
