import { getActiveProvider } from "@/services/ai";

const mockGetState = jest.fn();

jest.mock("@/services/storage", () => ({
  useSettingsStore: Object.assign(jest.fn(), {
    getState: mockGetState,
  }),
}));

describe("ai service", () => {
  beforeEach(() => {
    mockGetState.mockReset();
  });

  it("returns active provider", () => {
    mockGetState.mockReturnValue({
      providers: [{ id: "openai", apiKey: "test-key", model: "gpt-4o", enabled: true }],
      activeProvider: "openai",
    });

    const provider = getActiveProvider();
    expect(provider.id).toBe("openai");
    expect(provider.apiKey).toBe("test-key");
  });

  it("throws when no provider configured", () => {
    mockGetState.mockReturnValue({
      providers: [],
      activeProvider: "openai",
    });

    expect(() => getActiveProvider()).toThrow("No active provider configured");
  });
});
