import { Project, project } from "./project";
import { Cognito, cognito } from "./cognito";
import { OpenAPI, openapi } from "./openapi";
import { Frontend, frontend } from "./frontend";

export interface Configs {
  project: Project;
  cognito: Cognito;
  openapi: OpenAPI;
  frontend: Frontend;
}

const configs: Configs = {
  project,
  cognito,
  openapi,
  frontend,
};

export default configs;

if (!configs.project.domain)
  throw new Error(
    "PROJECT_DOMAIN must be set. Ex: PROJECT_DOMAIN=scrapnode.com"
  );
