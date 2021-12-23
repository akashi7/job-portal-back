import { db } from "../config/database";
import { hash, compare } from "bcryptjs";
import cloudinary from "../config/cloudinary";
import moment from "moment";



const uploadJobDoc = async (doc) => {
  try {
    if (doc.mimetype === 'image/jpeg' || doc.mimetype === 'image/png') {
      const image = await cloudinary.uploader.upload(doc.tempFilePath, (results) => results);
      doc = image.secure_url;
      return doc;
    }

  } catch (err) {
    console.log('err', err);
  }

};


export default class userController {

  static userUpdatePassword(req, res) {

    const { password, confirmPassword, oldPassword } = req.body;
    const { id } = req.user;

    if (password !== confirmPassword) {
      res.send({
        status: 305,
        message: "Password's do not match"
      });
    }
    else {
      db.getConnection((err, connection) => {
        if (err) console.log("ConnectionError", err);
        else {
          connection.query("SELECT * FROM employers WHERE id=?", [id], async (err, result) => {
            if (err) console.log("QuerryError", err);
            else {
              if (!(await compare(oldPassword, result[0].password))) {
                res.send({
                  status: 301,
                  message: "Incorrect old password"
                });
              }
              else {
                let hashedPassword = await hash(password, 8);
                connection.query("UPDATE employers SET password=? WHERE id=?", [hashedPassword, id], (err, results) => {
                  if (err) console.log("QuerryError", err);
                  else {
                    res.send({
                      status: 200,
                      message: "Password updated ok"
                    });
                  }
                  connection.release();
                });
              }
            }
          });
        }
      });
    }
  }

  static async empPostJob(req, res) {

    let postionNumber, newPositions;

    const { id, full_names, company } = req.user;
    const { jobCategory, jobType, document = {}, jobTitle, description, experience } = req.body;

    const Dates = new Date();
    const TodayMoment = Dates.toLocaleDateString();
    const Today = moment(TodayMoment).format("DD/MM/YYYY");

    const JobDocument = await uploadJobDoc(document);

    if (JobDocument || !JobDocument) {
      db.getConnection((err, connection) => {
        if (err) console.log("connectionError", err);
        else {
          connection.query("INSERT INTO jobs SET?", {
            emp_id: id,
            job_category: jobCategory,
            posted_by: full_names,
            company_name: company,
            job_type: jobType,
            document: JobDocument,
            posted_on: Today,
            description,
            job_title: jobTitle,
            experience
          }, (err, result) => {
            if (err) console.log("QuerryError", err);
            else {
              connection.query("SELECT * FROM job_category WHERE category_name=?", [jobCategory], (err, results) => {
                if (err) console.log("QuerryError", err);
                else {
                  const { positions } = results[0];
                  positions === null ? postionNumber = 0 : postionNumber = positions;
                  newPositions = parseInt(postionNumber) + 1;
                  connection.query("UPDATE job_category SET positions=? WHERE category_name=?", [newPositions, jobCategory], (err, resultss) => {
                    if (err) console.log("QuerryError", err);
                    else {
                      res.send({
                        status: 200,
                        message: "Job posted succesfully"
                      });
                    }
                    connection.release();
                  });
                }
              });
            }
          });
        }
      });
    }
    else {
      res.send({
        status: 400,
        message: "Error uploading file check your internet and file size must be less than 2MB"
      });
    }
  }

  static empViewAllHisJobs(req, res) {
    const { id } = req.user;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT * FROM jobs WHERE emp_id=?", [id], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { empJobs: result }
            });
          }
          connection.release();
        });
      }
    });
  };

  static viewOneJob(req, res) {
    const { jobId } = req.query;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT * FROM jobs WHERE id=?", [jobId], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { oneJob: result }
            });
          }
          connection.release();
        });
      }
    });
  }


  static viewApplicants(req, res) {
    const { jobId } = req.query;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT * FROM applications WHERE job_id=?", [jobId], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { applicants: result }
            });
          }
          connection.release();
        });
      }
    });

  }

  static viewOneApplicant(req, res) {
    const { userId } = req.query;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT * FROM applications WHERE id=?", [userId], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { applicants: result }
            });
          }
          connection.release();
        });
      }
    });
  }




}