export const BUTTON_INTERACTION = "BUTTON_INTERACTION";

export type ButtonInteractionOptions = {
  name: string;
  key: string;
};

export function ButtonInteraction(options: ButtonInteractionOptions): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(BUTTON_INTERACTION, options, target.prototype);

    return target;
  };
}
