export const natsClient = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (
          subject: string,
          data: string,
          callback: (err?: Error, guid?: string) => void
        ) => {
          callback(undefined, "GUID");
        }
      ),
  },
};
