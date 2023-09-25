import dbconfig from "../config/config.js";
import {
  getClient,
  connectToDB,
  closeDB,
} from "../config/mongodb.connection.js";
import utils from "../utils/helper.js";

const generateUserTimesheet = async (data, callback) => {
  console.log("generateUserTimesheet", data);
  try {
    await connectToDB();
    const query = { employee_id: data.id, period: data.period };
    const tms = getClient().db(dbconfig.database).collection("timesheet-data");
    const res = await tms.findOne(query);
    console.log("gtms", res);
    callback(true, res);
  } catch (err) {
    console.error(err);
    callback(false, err);
  } finally {
    await closeDB();
  }
};

const upsertUserTimesheet = async (data, callback) => {
  console.log("upsertUserTimesheet", data);
};

export { generateUserTimesheet, upsertUserTimesheet };
