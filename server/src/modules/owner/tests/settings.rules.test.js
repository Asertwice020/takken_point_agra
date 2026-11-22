import { describe, expect, it } from "vitest";
import { assertSettingsValid, mergeSettings } from "../logic/settings.rules.js";

const current = { open_time: "11:00:00", close_time: "22:00:00", booking_days_ahead: 1, cutoff_minutes: 5 };

describe("settings rules", () => {
  it("merges only the fields that were sent", () => {
    const merged = mergeSettings(current, { openTime: "10:30", cutoffMinutes: 10 });
    expect(merged).toMatchObject({ open_time: "10:30", close_time: "22:00:00", booking_days_ahead: 1, cutoff_minutes: 10 });
  });
  it("accepts valid hours", () => expect(() => assertSettingsValid(current)).not.toThrow());
  it("rejects closing before opening", () => expect(() => assertSettingsValid({ ...current, close_time: "10:00" })).toThrow());
  it("rejects times off the 30-minute grid", () => expect(() => assertSettingsValid({ ...current, open_time: "11:15" })).toThrow());
});

describe("shared stations setting", () => {
  it("can be changed like the other settings", () => {
    expect(mergeSettings({ ...current, stations: 2 }, { stations: 3 }).stations).toBe(3);
    expect(mergeSettings({ ...current, stations: 2 }, { cutoffMinutes: 10 }).stations).toBe(2);
  });
});





// import { describe, expect, it } from "vitest";
// import { assertSettingsValid, mergeSettings } from "../logic/settings.rules.js";

// const current = { open_time: "11:00:00", close_time: "22:00:00", booking_days_ahead: 1, cutoff_minutes: 5 };

// describe("settings rules", () => {
//   it("merges only the fields that were sent", () => {
//     const merged = mergeSettings(current, { openTime: "10:30", cutoffMinutes: 10 });
//     expect(merged).toMatchObject({ open_time: "10:30", close_time: "22:00:00", booking_days_ahead: 1, cutoff_minutes: 10 });
//   });
//   it("accepts valid hours", () => expect(() => assertSettingsValid(current)).not.toThrow());
//   it("rejects closing before opening", () => expect(() => assertSettingsValid({ ...current, close_time: "10:00" })).toThrow());
//   it("rejects times off the 30-minute grid", () => expect(() => assertSettingsValid({ ...current, open_time: "11:15" })).toThrow());
// });



