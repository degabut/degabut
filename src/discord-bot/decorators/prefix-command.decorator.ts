export const PREFIX_COMMAND = "PREFIX_COMMAND";

export type PrefixCommandOptions = {
  name: string;
  aliases?: string[];
};

export function PrefixCommand(options: PrefixCommandOptions): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(PREFIX_COMMAND, options, target.prototype);

    return target;
  };
}
