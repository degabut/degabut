import { Transform } from "class-transformer";

export const CollectionType = (
  dto: { create: (v: any) => unknown },
  accessor?: string,
): PropertyDecorator => {
  return Transform(({ obj, key }) => {
    const value = accessor ? obj[accessor] : obj[key];
    return [...value.values()].map(dto.create);
  });
};
