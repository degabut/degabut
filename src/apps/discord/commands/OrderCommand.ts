import {
	ChangeTrackOrderAdapter,
	ChangeTrackOrderUseCase,
} from "@modules/queue/useCases/ChangeTrackOrderUseCase";
import { inject, injectable } from "tsyringe";
import { CommandExecuteProps, ICommand } from "../core/ICommand";

@injectable()
export class OrderCommand implements ICommand {
	public readonly name = "order";
	public readonly aliases = ["o", "move", "mv"];
	public readonly description = "Move track order on queue";

	constructor(@inject(ChangeTrackOrderUseCase) private changeTrackOrder: ChangeTrackOrderUseCase) {}

	public async execute({ message, args }: CommandExecuteProps): Promise<void> {
		const from = +args[0] - 1;
		const to = +args[1] - 1;

		const adapter = new ChangeTrackOrderAdapter({ guildId: message.guild?.id, from, to });
		await this.changeTrackOrder.execute(adapter, { userId: message.author.id });
	}
}
