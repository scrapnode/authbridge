import { project } from "./project";

export interface Frontend {
  bucket: {
    name: string;
  };
}

const prefix = project.name.toLowerCase();
export const frontend: Frontend = {
  bucket: {
    name: `frontend-${prefix}.${project.domain}`,
  },
};
