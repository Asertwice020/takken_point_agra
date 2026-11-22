// * Countdowns use the SERVER's time, so a phone or PC with a wrong clock cannot show a wrong timer
let offsetMs = 0;

export const syncServerClock = (dateHeader: string) => {
  const serverMs = Date.parse(dateHeader);
  if (!Number.isNaN(serverMs)) offsetMs = serverMs - Date.now();
};

export const getServerNow = () => Date.now() + offsetMs;
