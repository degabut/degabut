export type EventHandlerRunParams<Params, Value> = {
	params: Params;
	value: Value;
};

export abstract class EventHandler<Params = unknown, Value = unknown> {
	abstract run(params: EventHandlerRunParams<Params, Value>): Promise<void>;
}
