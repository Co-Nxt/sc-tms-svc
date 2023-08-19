import dbconfig from "../config/config.js";
import {
  getClient,
  connectToDB,
  closeDB,
} from "../config/mongodb.connection.js";
import utils from "../utils/helper.js";

const getIndex = async (data, callback) => {
  console.log("dataIndex", data);

  try {
    await connectToDB();
    const tms = getClient().db(dbconfig.database).collection(data.collection);
    const res = await tms.find().toArray();
    callback(true, res);
  } catch (err) {
    console.error(err);
    callback(false, err);
  } finally {
    await closeDB();
  }
};

const upsertData = async (data, callback) => {
  const query = { _id: data.key }; // Specify the unique identifier for the user
  const update = {
    $set: data.data, // Data to update or insert
  };
  const options = {
    upsert: true, // Enable upsert
  };
  await connectToDB();
  const tms = getClient().db(dbconfig.database).collection(data.collection);
  try {
    const res = await tms.updateOne(query, update, options);
    console.log(`${res.modifiedCount} document(s) updated`);
    console.log(`${res.upsertedCount} document(s) inserted`);
    callback(true, data._id);
  } catch (err) {
    console.error(err);
    callback(false, err);
  } finally {
    await closeDB();
  }
};

const checkedIn = async (data, callback) => {
  //insert in worklogs-data and timesheet-data
  //retrieve data before adding to db
  console.log("api checkIn", data);
  const attendanceData = {
    _id: data._id,
    isCheckIn: data.checkedIn,
    timesheetReport: [
      {
        timesheet_code: utils.timesheet_code,
        workingSchedule: data.workingSchedule,
        department: data.department,
        period: utils.monthNow,
        timesheet: [
          {
            date: utils.dateNowFormat1,
            dutyHours: data.dutyHours,
            scheduleHours: data.scheduleHours,
            workHours: {
              from: data.workHours.from,
              to: data.workHours.to,
              hours: utils.calculateWorkingHours(
                data.workHours.from,
                data.workHours.to
              ),
            },
            actualOverTime: "2.5",
            actualWorkHours: "8.0",
            remarks: "UT",
          },
        ],
      },
    ],
  };
  console.log("attendanceData", attendanceData.timesheetReport[0].timesheet);
  const query = { _id: data._id }; // Specify the unique identifier for the user
  const update = {
    $setOnInsert: attendanceData, // Data to update or insert
  };
  const options = {
    upsert: true, // Enable upsert
  };
  await connectToDB();
  const tms = getClient().db(dbconfig.database).collection("timesheet-data");
  try {
    const res = await tms.updateOne(query, update, options);
    console.log(`${res.modifiedCount} document(s) updated`);
    console.log(`${res.upsertedCount} document(s) inserted`);
    callback(true, data._id);
  } catch (err) {
    console.error(err);
    callback(false, err);
  } finally {
    await closeDB();
  }
};

const getUserSchedule = async (data, callback) => {
  try {
    await connectToDB(); // Move this line before accessing the client
    const tms = getClient().db(dbconfig.database).collection(data.collection);
    const query = { _id: data._id };
    const res = await tms.findOne(query);
    callback(true, res);
  } catch (err) {
    console.error(err);
    callback(false, err);
  } finally {
    await closeDB();
  }
};

const getUserTimesheet = async(data, callback) => {
  console.log("getUserTimesheet", data);
  callback(true,data)
  //  try {
  //    await connectToDB(); // Move this line before accessing the client
  //    const tms = getClient().db(dbconfig.database).collection(data.collection);
  //    const query = { _id: data._id };
  //    const res = await tms.findOne(query);
  //    callback(true, res);
  //  } catch (err) {
  //    console.error(err);
  //    callback(false, err);
  //  } finally {
  //    await closeDB();
  //  }
}

export { getIndex, upsertData, checkedIn, getUserSchedule, getUserTimesheet };
