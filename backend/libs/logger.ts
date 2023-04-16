import pino from "pino";
import configs from "@backend/configs";

export const logger = pino({
  name: configs.project.name,
  level: configs.project.env === "development" ? "trace" : "info",
});
