import { body, param, query } from "express-validator";
import { handleValidation } from "../../../middlewares/validate.middleware.js";
import { BOOKING_STATUS } from "../../../constants.js";

export const validateOwnerBookingsQuery = [
  query("date").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
  query("status").optional().isIn(Object.values(BOOKING_STATUS)).withMessage("Unknown status"),
  handleValidation,
];

export const validateOwnerBookingId = [param("id").isInt({ min: 1 }).withMessage("Valid booking id is required").toInt(), handleValidation];

export const validateSetShopStatus = [body("isOpen").isBoolean({ strict: true }).withMessage("isOpen must be true or false"), handleValidation];

export const validateTicketScan = [
  body("code").trim().matches(/^[A-Za-z0-9]{4,20}$/).withMessage("Enter a valid ticket code"),
  handleValidation,
];

// ==========================================
// * SETTINGS, GAMES, BLOCKED SEATS
// ==========================================
const timeField = (name) => body(name).optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage(`${name} must be HH:MM`);
const intField = (name, min, max) => body(name).optional().isInt({ min, max }).withMessage(`${name} must be between ${min} and ${max}`).toInt();
const gameNameField = (isRequired) => {
  const field = isRequired ? body("name") : body("name").optional();
  return field.trim().notEmpty().withMessage("Name is required").isLength({ max: 40 }).withMessage("Name is too long");
};
const durationFields = [
  body("durations").isArray({ min: 1, max: 6 }).withMessage("Add 1 to 6 durations"),
  body("durations.*.minutes").isInt({ min: 30, max: 240 }).withMessage("Minutes must be 30 to 240")
    .custom((value) => Number(value) % 30 === 0).withMessage("Minutes must be a multiple of 30").toInt(),
  body("durations.*.price").isInt({ min: 0, max: 10000 }).withMessage("Price must be a whole rupee amount").toInt(),
  body("durations").custom((items) => new Set(items.map((item) => Number(item.minutes))).size === items.length).withMessage("Each duration must be different"),
];

export const validateUpdateSettings = [
  timeField("openTime"), timeField("closeTime"),
  intField("bookingDaysAhead", 0, 30), intField("cutoffMinutes", 0, 120),
  intField("rescheduleCutoffHours", 0, 72), intField("maxReschedules", 0, 5), intField("stations", 1, 20),
  handleValidation,
];

export const validateCreateGame = [gameNameField(true), intField("stations", 1, 20), ...durationFields, handleValidation];

export const validateUpdateGame = [
  param("id").isInt({ min: 1 }).withMessage("Valid game id is required").toInt(),
  gameNameField(false), intField("stations", 1, 20),
  body("isActive").optional().isBoolean({ strict: true }).withMessage("isActive must be true or false"),
  handleValidation,
];

export const validateSetGameDurations = [
  param("id").isInt({ min: 1 }).withMessage("Valid game id is required").toInt(),
  ...durationFields, handleValidation,
];

export const validateBlockSeats = [
  body("gameId").optional().isInt({ min: 1 }).withMessage("Valid gameId is required").toInt(),
  body("bookingDate").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
  body("startTime").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Start time must be HH:MM"),
  body("durationMinutes").isInt({ min: 30, max: 240 }).withMessage("Duration must be 30 to 240")
    .custom((value) => Number(value) % 30 === 0).withMessage("Duration must be a multiple of 30").toInt(),
  body("seats").isInt({ min: 1, max: 20 }).withMessage("Seats must be 1 to 20").toInt(),
  handleValidation,
];

export const validateBlockedSeatsQuery = [
  query("date").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
  handleValidation,
];

export const validateOwnerLogin = [
  body("email").trim().toLowerCase().isEmail().withMessage("Enter a valid email").isLength({ max: 254 }),
  body("password").isString().withMessage("Enter your password").isLength({ min: 1, max: 128 }).withMessage("Enter your password"),
  handleValidation,
];





// import { body, param, query } from "express-validator";
// import { handleValidation } from "../../../middlewares/validate.middleware.js";
// import { BOOKING_STATUS } from "../../../constants.js";

// export const validateOwnerBookingsQuery = [
//   query("date").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
//   query("status").optional().isIn(Object.values(BOOKING_STATUS)).withMessage("Unknown status"),
//   handleValidation,
// ];

// export const validateOwnerBookingId = [param("id").isInt({ min: 1 }).withMessage("Valid booking id is required").toInt(), handleValidation];

// export const validateSetShopStatus = [body("isOpen").isBoolean({ strict: true }).withMessage("isOpen must be true or false"), handleValidation];

// export const validateTicketScan = [
//   body("code").trim().matches(/^[A-Za-z0-9]{4,20}$/).withMessage("Enter a valid ticket code"),
//   handleValidation,
// ];

// // ==========================================
// // * SETTINGS, GAMES, BLOCKED SEATS
// // ==========================================
// const timeField = (name) => body(name).optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage(`${name} must be HH:MM`);
// const intField = (name, min, max) => body(name).optional().isInt({ min, max }).withMessage(`${name} must be between ${min} and ${max}`).toInt();
// const gameNameField = (isRequired) => {
//   const field = isRequired ? body("name") : body("name").optional();
//   return field.trim().notEmpty().withMessage("Name is required").isLength({ max: 40 }).withMessage("Name is too long");
// };
// const durationFields = [
//   body("durations").isArray({ min: 1, max: 6 }).withMessage("Add 1 to 6 durations"),
//   body("durations.*.minutes").isInt({ min: 30, max: 240 }).withMessage("Minutes must be 30 to 240")
//     .custom((value) => Number(value) % 30 === 0).withMessage("Minutes must be a multiple of 30").toInt(),
//   body("durations.*.price").isInt({ min: 0, max: 10000 }).withMessage("Price must be a whole rupee amount").toInt(),
//   body("durations").custom((items) => new Set(items.map((item) => Number(item.minutes))).size === items.length).withMessage("Each duration must be different"),
// ];

// export const validateUpdateSettings = [
//   timeField("openTime"), timeField("closeTime"),
//   intField("bookingDaysAhead", 0, 30), intField("cutoffMinutes", 0, 120),
//   intField("rescheduleCutoffHours", 0, 72), intField("maxReschedules", 0, 5), intField("stations", 1, 20),
//   handleValidation,
// ];

// export const validateCreateGame = [gameNameField(true), intField("stations", 1, 20), ...durationFields, handleValidation];

// export const validateUpdateGame = [
//   param("id").isInt({ min: 1 }).withMessage("Valid game id is required").toInt(),
//   gameNameField(false), intField("stations", 1, 20),
//   body("isActive").optional().isBoolean({ strict: true }).withMessage("isActive must be true or false"),
//   handleValidation,
// ];

// export const validateSetGameDurations = [
//   param("id").isInt({ min: 1 }).withMessage("Valid game id is required").toInt(),
//   ...durationFields, handleValidation,
// ];

// export const validateBlockSeats = [
//   body("gameId").optional().isInt({ min: 1 }).withMessage("Valid gameId is required").toInt(),
//   body("bookingDate").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
//   body("startTime").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Start time must be HH:MM"),
//   body("durationMinutes").isInt({ min: 30, max: 240 }).withMessage("Duration must be 30 to 240")
//     .custom((value) => Number(value) % 30 === 0).withMessage("Duration must be a multiple of 30").toInt(),
//   body("seats").isInt({ min: 1, max: 20 }).withMessage("Seats must be 1 to 20").toInt(),
//   handleValidation,
// ];

// export const validateBlockedSeatsQuery = [
//   query("date").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
//   handleValidation,
// ];





// // import { body, param, query } from "express-validator";
// // import { handleValidation } from "../../../middlewares/validate.middleware.js";
// // import { BOOKING_STATUS } from "../../../constants.js";

// // export const validateOwnerBookingsQuery = [
// //   query("date").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
// //   query("status").optional().isIn(Object.values(BOOKING_STATUS)).withMessage("Unknown status"),
// //   handleValidation,
// // ];

// // export const validateOwnerBookingId = [param("id").isInt({ min: 1 }).withMessage("Valid booking id is required").toInt(), handleValidation];

// // export const validateSetShopStatus = [body("isOpen").isBoolean({ strict: true }).withMessage("isOpen must be true or false"), handleValidation];

// // export const validateTicketScan = [
// //   body("code").trim().matches(/^[A-Za-z0-9]{4,20}$/).withMessage("Enter a valid ticket code"),
// //   handleValidation,
// // ];

// // // ==========================================
// // // * SETTINGS, GAMES, BLOCKED SEATS
// // // ==========================================
// // const timeField = (name) => body(name).optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage(`${name} must be HH:MM`);
// // const intField = (name, min, max) => body(name).optional().isInt({ min, max }).withMessage(`${name} must be between ${min} and ${max}`).toInt();
// // const gameNameField = (isRequired) => {
// //   const field = isRequired ? body("name") : body("name").optional();
// //   return field.trim().notEmpty().withMessage("Name is required").isLength({ max: 40 }).withMessage("Name is too long");
// // };
// // const durationFields = [
// //   body("durations").isArray({ min: 1, max: 6 }).withMessage("Add 1 to 6 durations"),
// //   body("durations.*.minutes").isInt({ min: 30, max: 240 }).withMessage("Minutes must be 30 to 240")
// //     .custom((value) => Number(value) % 30 === 0).withMessage("Minutes must be a multiple of 30").toInt(),
// //   body("durations.*.price").isInt({ min: 0, max: 10000 }).withMessage("Price must be a whole rupee amount").toInt(),
// //   body("durations").custom((items) => new Set(items.map((item) => Number(item.minutes))).size === items.length).withMessage("Each duration must be different"),
// // ];

// // export const validateUpdateSettings = [
// //   timeField("openTime"), timeField("closeTime"),
// //   intField("bookingDaysAhead", 0, 30), intField("cutoffMinutes", 0, 120),
// //   intField("rescheduleCutoffHours", 0, 72), intField("maxReschedules", 0, 5),
// //   handleValidation,
// // ];

// // export const validateCreateGame = [gameNameField(true), intField("stations", 1, 20), ...durationFields, handleValidation];

// // export const validateUpdateGame = [
// //   param("id").isInt({ min: 1 }).withMessage("Valid game id is required").toInt(),
// //   gameNameField(false), intField("stations", 1, 20),
// //   body("isActive").optional().isBoolean({ strict: true }).withMessage("isActive must be true or false"),
// //   handleValidation,
// // ];

// // export const validateSetGameDurations = [
// //   param("id").isInt({ min: 1 }).withMessage("Valid game id is required").toInt(),
// //   ...durationFields, handleValidation,
// // ];

// // export const validateBlockSeats = [
// //   body("gameId").isInt({ min: 1 }).withMessage("Valid gameId is required").toInt(),
// //   body("bookingDate").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
// //   body("startTime").matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage("Start time must be HH:MM"),
// //   body("durationMinutes").isInt({ min: 30, max: 240 }).withMessage("Duration must be 30 to 240")
// //     .custom((value) => Number(value) % 30 === 0).withMessage("Duration must be a multiple of 30").toInt(),
// //   body("seats").isInt({ min: 1, max: 20 }).withMessage("Seats must be 1 to 20").toInt(),
// //   handleValidation,
// // ];

// // export const validateBlockedSeatsQuery = [
// //   query("date").optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
// //   handleValidation,
// // ];
