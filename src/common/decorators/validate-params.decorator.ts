import { MethodDecorator } from "@common/interfaces";
import { BadRequestException } from "@nestjs/common";
import { Schema } from "joi";

export const ValidateParams = (...schemas: Schema[]): MethodDecorator<(...args: any[]) => any> => {
  return (t, p, descriptor) => {
    const method = descriptor.value;

    descriptor.value = async function (this: any, ...args: unknown[]) {
      const validatedArgs: unknown[] = [];
      for (const [i, schema] of schemas.entries()) {
        const result = schema.validate(args[i], { stripUnknown: true });
        if (result.error) throw new BadRequestException(result.error.message);
        validatedArgs.push(result.value);
      }
      return method?.call(this, ...validatedArgs);
    } as any;

    return descriptor;
  };
};
