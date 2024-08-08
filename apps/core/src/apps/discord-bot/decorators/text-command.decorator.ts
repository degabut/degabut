import { MethodDecorator } from "@common/interfaces";

export const TEXT_COMMAND = "TEXT_COMMAND";

export type PrefixCommandOptions = {
  name: string;
  description?: string;
  aliases?: string[];
};

export function TextCommand(options: PrefixCommandOptions): MethodDecorator {
  return (t: any, p, descriptor) => {
    Reflect.defineMetadata(TEXT_COMMAND, options, t, p);
    return descriptor;
  };
}
