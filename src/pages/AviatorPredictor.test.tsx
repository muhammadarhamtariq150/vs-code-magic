import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// --- Mock supabase client ---
let nextCrash: number | null = 2.45;
let resolveFetch: (() => void) | null = null;
let pendingMode = false; // when true, queries hang until resolveFetch() is called

const buildQuery = () => {
  const q: any = {};
  q.select = vi.fn(() => q);
  q.eq = vi.fn(() => q);
  q.order = vi.fn(() => q);
  q.limit = vi.fn(() => q);
  q.maybeSingle = vi.fn(() => {
    if (pendingMode) {
      return new Promise((res) => {
        resolveFetch = () =>
          res({ data: nextCrash !== null ? { crash_point: nextCrash } : null });
      });
    }
    return Promise.resolve({
      data: nextCrash !== null ? { crash_point: nextCrash } : null,
    });
  });
  return q;
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => buildQuery()),
    channel: vi.fn(() => {
      const ch: any = {};
      ch.on = vi.fn(() => ch);
      ch.subscribe = vi.fn(() => ch);
      return ch;
    }),
    removeChannel: vi.fn(),
  },
}));

import AviatorPredictor from "./AviatorPredictor";

const renderPage = () =>
  render(
    <MemoryRouter>
      <AviatorPredictor />
    </MemoryRouter>
  );

beforeEach(() => {
  nextCrash = 2.45;
  pendingMode = false;
  resolveFetch = null;
});

describe("AviatorPredictor", () => {
  it("reveals instantly from cache without showing skeleton", async () => {
    renderPage();

    // Wait for prefetch on mount to populate the cache
    await waitFor(() => {
      // initial state shows the play button (no skeleton, no number yet)
      expect(screen.queryByText(/Scanning round/i)).not.toBeInTheDocument();
    });

    // Click the main "Start Prediction" button
    fireEvent.click(screen.getByRole("button", { name: /Start Prediction/i }));

    // Number appears immediately, no shimmer/skeleton
    await waitFor(() => {
      expect(screen.getByText("2.45")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Scanning round/i)).not.toBeInTheDocument();
  });

  it("shows skeleton/shimmer when cache is empty and a fetch is in-flight", async () => {
    // First mount: no data available, prefetch returns null -> cache stays null
    nextCrash = null;
    renderPage();

    // Wait until the prefetch settles
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Start Prediction/i })).toBeInTheDocument();
    });

    // Now make the next fetch hang so we can observe the skeleton state
    pendingMode = true;
    nextCrash = 3.14;

    fireEvent.click(screen.getByRole("button", { name: /Start Prediction/i }));

    // Skeleton/shimmer indicator visible
    await waitFor(() => {
      expect(screen.getByText(/Scanning round/i)).toBeInTheDocument();
    });
    expect(screen.queryByText("3.14")).not.toBeInTheDocument();

    // Resolve the in-flight fetch -> reveal happens
    await act(async () => {
      resolveFetch?.();
    });

    await waitFor(() => {
      expect(screen.getByText("3.14")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Scanning round/i)).not.toBeInTheDocument();
  });
});
