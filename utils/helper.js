import moment from "moment";
import { v4 } from "uuid";
import bcrpyt from "bcryptjs";

const uuid = v4();
const dateNow = moment().format();
const dateNowFormat1 = moment().format("MM-DD-YYYY");
const dateNowFormat2 = moment().format("MM/DD/YYYY");
const dateNowForSeries = moment().format("YYYYMMDD");
const dateNowMilitary = () => moment().format("H:mm"); //24hr
const monthNow = moment().format("MM/YYYY");
const timesheet_code = Math.floor(Math.random() * 900000);
const hashPassword = async (password) => await bcrpyt.hash(password, 10);
const calculateWorkingHours = (timeStarted, timeEnded) => {
  const startTime = moment(timeStarted, "h:mm A");
  const endTime = moment(timeEnded, "h:mm A");

  const durationInMillis = endTime.diff(startTime);
  const decimalHours = durationInMillis / (1000 * 60 * 60);

  return decimalHours.toFixed(2);
};
const worklogsID = () => {
  const prefix = "A";
  const date = dateNowForSeries;
  const suffix = generateRandomString(3);
  return `${prefix}${date}${suffix}`;
};

const generateRandomString = (length) => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // You can customize the character set as needed
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset.charAt(randomIndex);
  }

  return result;
};

export default {
  uuid,
  dateNow,
  timesheet_code,
  dateNowFormat1,
  dateNowFormat2,
  dateNowMilitary,
  hashPassword,
  monthNow,
  calculateWorkingHours,
  worklogsID,
};
