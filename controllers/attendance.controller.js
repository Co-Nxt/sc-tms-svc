import {
  getIndex,
  upsertData,
  checkedIn,
  getUserSchedule,
  getUserTimesheet,
  checkUserAttandance,
} from "../services/attendance.service.js";
import responseModel from "../models/response.model.js";

const index = (req, res) => {
  getIndex(req.body, (isSuccess, data) => {
    console.log("isSuccess", isSuccess);
    console.log("res", data);
    if (isSuccess) {
      res.status(200).send(data);
    } else {
      res.status(404).send({ message: "Not Found" });
    }
  });
};

const upsert = (req, res) => {
  console.log("req.body", req.body);
  upsertData(req.body, (isSuccess, data) => {
    if (isSuccess) {
      res.status(200).send({ message: "stored success!", data: req.body.data });
    }
  });
};

const checkedin = (req, res) => {
  console.log("req.body", req.body);
  checkedIn(req.body, (isSuccess, data) => {
    if (isSuccess) {
      res.status(200).send({ ...responseModel.successModel, data: data });
    }
  });
};

const getSchedule = (req, res) => {
  getUserSchedule(req.body, (isSuccess, data) => {
    isSuccess ? res.status(200).send(data) : res.status(500).send(data);
  });
};
const getTimesheet = async (req, res) => {
  getUserTimesheet(req.body, (isSuccess, data) => {
    isSuccess ? res.status(200).send(data) : res.status(500).send(data);
  });
};

const checkAttandance = async (req, res) => {
  checkUserAttandance(req.body, (isSuccess, data) => {
    isSuccess
      ? res.status(200).send({
          ...responseModel.successModel,
          data,
        })
      : res.status(200).send({
          ...responseModel.failModel,
          data,
        });
  });
};
export { index, upsert, checkedin, getSchedule, getTimesheet, checkAttandance };
