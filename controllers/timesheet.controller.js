import {
  generateUserTimesheet,
  upsertUserTimesheet,
} from "../services/timesheet.service.js";
import responseModel from "../models/response.model.js";

const generateTimesheet = async (req, res) => {
  generateUserTimesheet(req.body, (isSuccess, data) => {
    isSuccess ? res.status(200).send(data) : res.status(500).send(data);
  });
};

const upsertTimesheet = async (req, res) => {
  upsertUserTimesheet(req.body, (isSuccess, data) => {
    isSuccess ? res.status(200).send(data) : res.status(500).send(data);
  });
};
export { generateTimesheet, upsertTimesheet };
