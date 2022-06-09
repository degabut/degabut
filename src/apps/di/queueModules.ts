import { EventHandler, UseCase } from "@core";
import { OnTrackAddEvent } from "@modules/queue/events/OnTrackAddEvent";
import { OnTrackEndEvent } from "@modules/queue/events/OnTrackEndEvent";
import { QueueRepository } from "@modules/queue/repositories/QueueRepository";
import { QueueService } from "@modules/queue/services/QueueService";
import { TrackService } from "@modules/queue/services/TrackService";
import { AddTrackUseCase } from "@modules/queue/useCases/AddTrackUseCase";
import { AutoAddTrackUseCase } from "@modules/queue/useCases/AutoAddTrackUseCase";
import { ChangeLoopTypeUseCase } from "@modules/queue/useCases/ChangeLoopTypeUseCase";
import { ChangeTrackOrderUseCase } from "@modules/queue/useCases/ChangeTrackOrderUseCase";
import { DisconnectUseCase } from "@modules/queue/useCases/DisconnectUseCase";
import { GetNowPlayingLyricUseCase } from "@modules/queue/useCases/GetNowPlayingLyricUseCase";
import { GetNowPlayingUseCase } from "@modules/queue/useCases/GetNowPlayingUseCase";
import { GetQueueTracksUseCase } from "@modules/queue/useCases/GetQueueTracksUseCase";
import { GetRelatedUseCase } from "@modules/queue/useCases/GetRelatedUseCase";
import { GetUserQueueUseCase } from "@modules/queue/useCases/GetUserQueueUseCase";
import { JoinUseCase } from "@modules/queue/useCases/JoinUseCase";
import { RemoveTrackUseCase } from "@modules/queue/useCases/RemoveTrackUseCase";
import { SetPauseUseCase } from "@modules/queue/useCases/SetPauseUseCase";
import { SkipUseCase } from "@modules/queue/useCases/SkipUseCase";
import { ToggleAutoplayUseCase } from "@modules/queue/useCases/ToggleAutoplayUseCase";
import { ToggleShuffleUseCase } from "@modules/queue/useCases/ToggleShuffleUseCase";
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
	JoinUseCase,
	RemoveTrackUseCase,
	ChangeTrackOrderUseCase,
	SetPauseUseCase,
	SkipUseCase,
	ToggleAutoplayUseCase,
	ToggleShuffleUseCase,
];

const events = [OnTrackAddEvent, OnTrackEndEvent];

const services = [QueueService, TrackService];

export const registerQueueModules = (): void => {
	container.registerSingleton(QueueRepository);

	services.map((S) => container.registerSingleton<unknown>(S));
	useCases.map((U) => container.registerSingleton<UseCase>(U));
	events.map((E) => container.registerSingleton<EventHandler>(E));
};
