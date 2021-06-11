export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({ id: "some_charge_id" }),
  },
  paymentIntents: {
    create: jest
      .fn()
      .mockResolvedValue({ success: true, data: { intent: "client_secret" } }),
    retrieve: jest.fn().mockImplementation((pi: string) => {
      return { charges: { data: [{ id: pi }] } };
    }),
  },
};
