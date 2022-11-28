import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { QueueRepository } from "@queue/repositories";
import { YoutubeCachedService } from "@youtube/services";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";

import { AddTrackHandler } from "./add-track.handler";

const moduleMocker = new ModuleMocker(global);
const mockHandler = async (queueTrackSize = 0) => {
  const moduleRef = await Test.createTestingModule({
    controllers: [AddTrackHandler],
  })
    .useMocker((token) => {
      switch (token) {
        case QueueRepository:
          return {
            getByVoiceChannelId: jest.fn().mockReturnValue({
              voiceChannel: {
                members: [{ id: "1" }],
              },
              tracks: Array(queueTrackSize),
            }),
          };

        case YoutubeCachedService:
          return {
            getVideo: jest.fn().mockResolvedValue({}),
            searchOneVideo: jest.fn().mockResolvedValue({}),
          };
      }

      if (typeof token === "function") {
        const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
        const Mock = moduleMocker.generateFromMetadata(mockMetadata);
        return new Mock();
      }
    })
    .compile();

  return moduleRef.get(AddTrackHandler);
};

describe("add track command", () => {
  it("keyword shouldn't be empty", async () => {
    const addTrackHandler = await mockHandler();

    const command = {
      voiceChannelId: "1",
      keyword: "",
      executor: { id: "1" },
    };

    await expect(addTrackHandler.execute(command)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("executor should be in voice channel", async () => {
    const addTrackHandler = await mockHandler();

    const command = {
      voiceChannelId: "1",
      keyword: "foo",
    };

    const validCommand = {
      ...command,
      executor: { id: "1" },
    };

    const invalidCommand = {
      ...command,
      executor: { id: "0" },
    };

    await expect(addTrackHandler.execute(validCommand)).resolves.toBeTruthy();
    await expect(addTrackHandler.execute(invalidCommand)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("shouldn't be able to add track when queue is full", async () => {
    const addTrackHandler = await mockHandler(250);

    const command = {
      voiceChannelId: "1",
      keyword: "foo",
      executor: { id: "1" },
    };

    await expect(addTrackHandler.execute(command)).rejects.toBeInstanceOf(BadRequestException);
  });
});
