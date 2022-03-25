export abstract class EventHandler<Data = unknown> {
	abstract run(params: Data): Promise<void>;
}
