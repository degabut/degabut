import { EventHandler, UseCase } from "@core";
import { OnTrackAddEvent } from "@modules/queue/events/OnTrackAddEvent";
import { OnTrackEndEvent } from "@modules/queue/events/OnTrackEndEvent";
import { QueueMemoryRepository } from "@modules/queue/repositories/Memory/QueueMemoryRepository";
import { QueueService } from "@modules/queue/services/QueueService";
import { AddTrackUseCase } from "@modules/queue/useCases/AddTrackUseCase";
import { AutoAddTrackUseCase } from "@modules/queue/useCases/AutoAddTrackUseCase";
import { ChangeLoopTypeUseCase } from "@modules/queue/useCases/ChangeLoopTypeUseCase";
import { DisconnectUseCase } from "@modules/queue/useCases/DisconnectUseCase";
import { GetNowPlayingLyricUseCase } from "@modules/queue/useCases/GetNowPlayingLyricUseCase";
import { GetNowPlayingUseCase } from "@modules/queue/useCases/GetNowPlayingUseCase";
import { GetQueueTracksUseCase } from "@modules/queue/useCases/GetQueueTracksUseCase";
import { GetRelatedUseCase } from "@modules/queue/useCases/GetRelatedUseCase";
import { GetUserQueueUseCase } from "@modules/queue/useCases/GetUserQueueUseCase";
import { RemoveTrackUseCase } from "@modules/queue/useCases/RemoveTrackUseCase";
import { SkipTrackUseCase } from "@modules/queue/useCases/SkipTrackUseCase";
import { ToggleAutoplayUseCase } from "@modules/queue/useCases/ToggleAutoplayUseCase";
import { container } from "tsyringe";

const useCases = [
	AddTrackUseCase,
	AutoAddTrackUseCase,
	ChangeLoopTypeUseCase,
	DisconnectUseCase,
	GetNowPlayingLyricUseCase,
	GetNowPlayingUseCase,
	GetQueueTracksUseCase,
	GetRelatedUseCase,
	GetUserQueueUseCase,
	RemoveTrackUseCase,
	SkipTrackUseCase,
	ToggleAutoplayUseCase,
];

const events = [OnTrackAddEvent, OnTrackEndEvent];

const services = [QueueService];

export const registerQueueModules = (): void => {
	container.registerSingleton("QueueRepository", QueueMemoryRepository);

	services.map((S) => container.registerSingleton(S));
	useCases.map((U) => container.registerSingleton<UseCase>(U));
	events.map((E) => container.registerSingleton<EventHandler>(E));
};
