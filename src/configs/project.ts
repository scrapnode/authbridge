export interface Project {
  debug: boolean;
  env: string;
  name: string;
  region: string;
}

export const project: Project = {
  debug: false,
  env: process.env.PROJECT_ENV || "production",
  name: process.env.PROJECT_NAME || "AuthBridge",
  region: process.env.PROJECT_REGION || "us-east-2",
};
if (project.env === "development") project.debug = true;
