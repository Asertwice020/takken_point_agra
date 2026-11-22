import "dotenv/config";

// * Server refuses to boot when a required variable is missing
const REQUIRED_ENV = ["DATABASE_URL", "CLIENT_ORIGIN", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "OWNER_EMAILS", "OWNER_PASS", "UPI_ID", "UPI_PAYEE_NAME", "GMAIL_USER", "GMAIL_APP_PASSWORD"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length) throw new Error(`Missing environment variables: ${missingEnv.join(", ")}`);

export const env = Object.freeze({
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  dbSsl: process.env.DB_SSL !== "false",
  clientOrigin: process.env.CLIENT_ORIGIN,
  supabaseUrl: process.env.SUPABASE_URL,
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  ownerEmails: process.env.OWNER_EMAILS.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean),
  ownerPass: process.env.OWNER_PASS,
  upiId: process.env.UPI_ID,
  upiPayeeName: process.env.UPI_PAYEE_NAME,
  gmailUser: process.env.GMAIL_USER,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, ""),
});
