import fs from "fs";
import path from "path";
import { TemplateDelegate, compile } from "handlebars";

export class Handlebars {
  private readonly directory: string;
  private readonly values: object;
  private cache: { [name: string]: TemplateDelegate } = {};

  constructor(dir: string, values: object) {
    this.directory = dir;
    this.values = values;
  }

  async render(name: string, props: any) {
    const render = await this.get(name);
    return render({ now: () => new Date(), ...this.values, ...props });
  }

  private async get(name: string): Promise<TemplateDelegate> {
    if (!this.cache[name]) {
      const filepath = path.resolve(this.directory, `${name}.hbs`);
      const template = await fs.promises.readFile(filepath, "utf8");
      this.cache[name] = compile(template);
    }

    return this.cache[name];
  }
}
