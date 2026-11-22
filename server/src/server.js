import { app } from "./app.js";
import { env } from "./config/env.js";
import { startBookingJobs } from "./modules/booking/jobs/booking.jobs.js";

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
  startBookingJobs();
});
