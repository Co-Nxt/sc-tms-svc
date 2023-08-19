import {
  registration,
  login,
  validate,
  getUser,
} from "../controllers/auth.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

export default function(app) {
    app.post("/api/auth/register", registration);
    app.post("/api/auth/login", login);
    app.post("/api/auth/validate", validate);
    app.get("/api/auth/getUser", authenticateToken, getUser);
}   