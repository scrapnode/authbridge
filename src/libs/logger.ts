import pino from "pino";
import { project } from "@configs/project";

export const logger = pino({
  name: project.name,
  level: project.debug ? "trace" : "info",
});
