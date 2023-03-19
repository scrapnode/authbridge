import fs from "fs";
import path from "path";
import Mustache from "mustache";
import { project } from "@configs/project";
import { cognito } from "@configs/cognito";

export class Template {
  private readonly directory: string;
  private cache: { [name: string]: string } = {};

  constructor(dir: string) {
    this.directory = dir;
  }

  async render(name: string, props: any) {
    const template = await this.get(name);
    return Mustache.render(template, { ...this.base(), ...props });
  }

  private base(): { [name: string]: any } {
    return {
      now: () => new Date(),
      project,
      cognito,
    };
  }

  private async get(name: string): Promise<string> {
    if (!this.cache[name]) {
      const filepath = path.resolve(this.directory, `${name}.mustache`);
      this.cache[name] = await fs.promises.readFile(filepath, "utf8");
    }

    return this.cache[name];
  }
}
