export interface Project {
  debug: boolean;
  env: string;
  region: string;
  name: string;
  domain: string;
}

export const project: Project = {
  debug: false,
  env: process.env.PROJECT_ENV || "production",
  region: process.env.PROJECT_REGION || "us-east-2",
  name: process.env.PROJECT_NAME || "AuthBridge",
  domain: process.env.PROJECT_DOMAIN || "",
};
if (project.env === "development") project.debug = true;
