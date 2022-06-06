import { Transform } from "class-transformer";

export const CollectionType = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	dto: { create: (v: any) => unknown },
	accessor?: string
): PropertyDecorator => {
	return Transform(({ obj, key }) => {
		const value = accessor ? obj[accessor] : obj[key];
		return [...value.values()].map(dto.create);
	});
};
