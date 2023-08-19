import moment from "moment";
import { v4 } from "uuid";
import bcrpyt from "bcryptjs";

const uuid = v4();
const dateNow = moment().format();
const dateNowFormat1 = moment().format("MM-DD-YYYY");
const monthNow = moment().format("MM/YYYY");
const timesheet_code = Math.floor(Math.random() * 900000);
const hashPassword = async (password) => await bcrpyt.hash(password, 10);
const calculateWorkingHours = (timeStarted, timeEnded) => {
 const startTime = moment(timeStarted, "h:mm A");
 const endTime = moment(timeEnded, "h:mm A");

 const durationInMillis = endTime.diff(startTime);
 const decimalHours = durationInMillis / (1000 * 60 * 60);

 return decimalHours.toFixed(2)
}
export default {
  uuid,
  dateNow,
  timesheet_code,
  dateNowFormat1,
  hashPassword,
  monthNow,
  calculateWorkingHours,
};
