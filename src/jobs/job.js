import { db } from "../config/database";
import moment from "moment";


export const disableDueJobs = () => {
  const date = new Date();
  const TodayMoment = date.toLocaleDateString();

  const todayDate = moment(TodayMoment).format("DD/MM/YYYY");

  db.getConnection((err, connection) => {
    if (err) console.log("ConnectionError", err);
    else {
      let due = 'old';
      connection.query("UPDATE jobs SET due=? WHERE expiry_date=?", [due, todayDate], (err, result) => {
        if (err) console.log("querryError", err);
        else {
          console.log("........success.......");
        }
        connection.release();

      });
    }
  });
};

