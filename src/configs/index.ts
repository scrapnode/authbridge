import { Project, project } from "@configs/project";
import { Cognito, cognito } from "@configs/cognito";

export interface Configs {
  project: Project;
  cognito: Cognito;
}

const configs: Configs = {
  project,
  cognito,
};

export default configs;
