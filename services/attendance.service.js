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
// Attendance
const checkedIn = async (data, callback) => {
  const query = { employee_id: data.id, date: data.date };

  const withExistingRecord = await checkIfWithExistingAtt2(query);
  console.log("withExistingRecord", withExistingRecord);
  //check if with Existing attendance
  if (!withExistingRecord) {
    console.log("No Existing!");

    const newAtt = await newAttendance2(data);
    console.log("newAtt", newAtt);
    callback(true, newAtt);
  } else {
    console.log("with existing");
    console.log("withExistingRecord.remarks", withExistingRecord.remarks);
    if (withExistingRecord.remarks === "ABS") {
      //update attendance to CMPLT
      const upsertAtt = await updateAttendance2(query, withExistingRecord);
      console.log("upsertAtt", upsertAtt);
      callback(true, upsertAtt);
    } else {
      console.log("Already have attendance");
      //message helper
      callback(false, { message: "Already have attendance" });
    }
  }
};

const checkIfWithExistingAtt2 = async (query) => {
  // const query = { employee_id: data.id, date: data.date };
  // {employee_id:"12cb5926-15b2-4a33-be5b-2b7aeb31e639",timesheetReport:{$elemMatch: { date: "08/11/2023" }}}
  // console.log("query", query);
  try {
    await connectToDB();
    const session = getClient().startSession();
    try {
      session.startTransaction();
      const q1 = getClient().db(dbconfig.database).collection("worklogs-data");
      const q2 = getClient().db(dbconfig.database).collection("timesheet-data");

      const checkWD = await q1.findOne(query, session);
      const checkTMS = await q2.findOne(
        {
          employee_id: query.employee_id,
          timesheetReport: { $elemMatch: { date: query.date } },
        },
        session
      );
      console.log("checkWD", checkWD);
      console.log("checkTMS", checkTMS);
      if (checkWD && checkTMS) {
        await session.commitTransaction();
        session.endSession();
        console.log("Transaction committed successfully.");
        return checkWD;
      } else {
        await session.abortTransaction();
        session.endSession();
        console.log("Transaction aborted.");
        return false;
      }
    } catch (error) {
      console.error("Error during transaction:", error);
      await session.abortTransaction();
      session.endSession();
    }
  } catch (err) {
    console.error(err);
    return err;
  } finally {
    await closeDB();
  }
};
const newAttendance2 = async (data) => {
  try {
    await connectToDB();
    const session = getClient().startSession();
    try {
      session.startTransaction();
      const wd_attendance = {
        _id: utils.worklogsID(),
        employee_id: data.id,
        period: data.period,
        date: data.date,
        workHours: {
          from: utils.dateNowMilitary(),
          to: "",
          hours: "",
        },
        dutyHours: {
          from: data.dutyHours.from,
          to: data.dutyHours.to,
        },
        actualWorkHours: data.actualWorkHours,
        remarks: "ABS",
      };
      const tms_filter = {
        employee_id: data.id,
        period: data.period,
      };
      const tms_update = {
        $set: {
          employee_id: data.id,
          period: data.period,
          name: data.name,
          phone: data.phone,
          email: data.email,
        },
        $addToSet: {
          timesheetReport: wd_attendance,
        },
        $inc: {
          count: 1,
        },
        $setOnInsert: {
          _id: utils.worklogsID(),
          createdAt: utils.dateNow,
          updatedAt: utils.dateNow,
        },
      };
      const option = {
        upsert: true,
      };
      const wd = getClient().db(dbconfig.database).collection("worklogs-data");
      const tmsd = getClient()
        .db(dbconfig.database)
        .collection("timesheet-data");

      const q1 = await wd.insertOne(wd_attendance, session);
      const q2 = await tmsd.updateOne(tms_filter, tms_update, option, session);

      if (q1 && q2) {
        await session.commitTransaction();
        session.endSession();
        console.log("Transaction committed successfully.");
        return true;
      } else {
        await session.abortTransaction();
        session.endSession();
        console.log("Transaction aborted.");
        return false;
      }
    } catch (error) {
      console.error("Error during transaction:", error);
      await session.abortTransaction();
      session.endSession();
    }
  } catch (error) {
    console.error(err);
    return err;
  } finally {
    await closeDB();
  }
};
const updateAttendance2 = async (query, data) => {
  try {
    console.log("test", utils.dateNowMilitary());
    const calculateWorkHrs = utils.calculateWorkingHours(
      data.workHours.from,
      utils.dateNowMilitary()
    );
    await connectToDB();
    const session = getClient().startSession();
    try {
      session.startTransaction();
      const wd_update = {
        "workHours.to": utils.dateNowMilitary(),
        "workHours.hours": calculateWorkHrs,
        remarks: "CMPLT",
      };
      const tms_filter = {
        employee_id: query.employee_id,
        "timesheetReport.date": query.date,
      };
      const tms_update = {
        $set: {
          "timesheetReport.$.workHours.to": utils.dateNowMilitary(),
          "timesheetReport.$.workHours.hours": calculateWorkHrs,
          "timesheetReport.$.remarks": "CMPLT",
        },
      };
      const wd = getClient().db(dbconfig.database).collection("worklogs-data");
      const tmsd = getClient()
        .db(dbconfig.database)
        .collection("timesheet-data");
      const q1 = await wd.updateOne(query, { $set: wd_update }, session);
      const q2 = await tmsd.updateOne(tms_filter, tms_update, session);
      if (q1.modifiedCount == 1 && q2.modifiedCount == 1) {
        await session.commitTransaction();
        session.endSession();
        console.log("Transaction committed successfully.");
        return true;
      } else {
        await session.abortTransaction();
        session.endSession();
        console.log("Transaction aborted.");
        return false;
      }
    } catch (error) {
      console.error("Error during transaction:", error);
      await session.abortTransaction();
      session.endSession();
    }
  } catch (error) {
    console.error(err);
    return err;
  } finally {
    await closeDB();
  }
};

// end of attendance
const getUserSchedule = async (data, callback) => {
  try {
    await connectToDB(); // Move this line before accessing the client
    const tms = getClient().db(dbconfig.database).collection(data.collection);
    const query = { employee_id: data._id, period: utils.monthNow };
    const res = await tms.findOne(query);
    callback(true, res);
  } catch (err) {
    console.error(err);
    callback(false, err);
  } finally {
    await closeDB();
  }
};

const getUserTimesheet = async (data, callback) => {
  console.log("getUserTimesheet", data);
  callback(true, data);
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
};

const checkUserAttandance = async (data, callback) => {
  console.log("checkUserAttandance", data);
  const query = { employee_id: data.id, date: data.date };
  const res = await checkIfWithExistingAtt2(query);
  console.log("res", res);
  return res ? callback(true, res) : callback(false, res);
};
// const checkIfWithExistingAtt = async (query) => {
//   try {
//     await connectToDB(); // Move this line before accessing the client
//     const tms = getClient().db(dbconfig.database).collection("worklogs-data");
//     const res = await tms.findOne(query);
//     return res;
//   } catch (err) {
//     console.error(err);
//     return err;
//   } finally {
//     await closeDB();
//   }
// };
const updateAttendance = async (query, data) => {
  console.log("test", utils.dateNowMilitary());
  const calculateWorkHrs = utils.calculateWorkingHours(
    data.workHours.from,
    utils.dateNowMilitary()
  );
  try {
    const updateQuery = {
      "workHours.to": utils.dateNowMilitary(),
      "workHours.hours": calculateWorkHrs,
      remarks: "CMPLT",
    };
    await connectToDB(); // Move this line before accessing the client
    const tms = getClient().db(dbconfig.database).collection("worklogs-data");
    const res = await tms.updateOne(query, { $set: updateQuery });
    return res;
  } catch (err) {
    console.error(err);
    return err;
  } finally {
    await closeDB();
  }
};
const newAttendance = async (data) => {
  const attendanceData = {
    _id: utils.worklogsID(),
    employee_id: data.id,
    period: data.period,
    date: data.date,
    workHours: {
      from: utils.dateNowMilitary(),
      to: "",
      hours: "",
    },
    dutyHours: {
      from: data.dutyHours.from,
      to: data.dutyHours.to,
    },
    actualWorkHours: data.actualWorkHours,
    remarks: "ABS",
  };
  console.log("newAttns", attendanceData);
  try {
    await connectToDB();
    const tms = getClient().db(dbconfig.database).collection("worklogs-data");
    const res = await tms.insertOne(attendanceData);
    return res;
  } catch (err) {
    console.error(err);
    return err;
  } finally {
    await closeDB();
  }
};
export {
  getIndex,
  upsertData,
  checkedIn,
  getUserSchedule,
  getUserTimesheet,
  checkUserAttandance,
  checkIfWithExistingAtt2,
};
