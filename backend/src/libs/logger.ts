import pino from "pino";
import configs from "@configs";

export const logger = pino({
  name: configs.project.name,
  level: configs.backend.stage === "dev" ? "trace" : "info",
});
