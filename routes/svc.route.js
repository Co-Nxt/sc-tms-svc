import {
  upsert,
  index,
  checkedin,
  getSchedule,
  getTimesheet,
  checkAttandance,
} from "../controllers/attendance.controller.js";
import { generateTimesheet } from "../controllers/timesheet.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

export default function (app) {
  app.post("/api/attendances/upsert", authenticateToken, upsert);
  app.post("/api/attendances/getAll", authenticateToken, index);
  // app.post("/api/attendances/checkedIn", authenticateToken, checkedin);
  app.post("/api/attendances/checkedIn", checkedin);
  // app.post("/api/attendances/getSchedule", authenticateToken, getSchedule);
  app.post("/api/attendances/getTimesheet", getTimesheet);
  app.post("/api/attendances/checkAttandance", checkAttandance);

  app.post("/api/attendances/getSchedule", getSchedule);
  app.post("/api/timesheet/generate", generateTimesheet);
}