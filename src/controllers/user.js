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
    const { jobCategory, jobType, jobTitle, description, experience, deadLine } = req.body;
    const { document = {} } = req.files;

    const Dates = new Date();
    const TodayMoment = Dates.toLocaleDateString();
    const Today = moment(TodayMoment).format("YYYY/MM/DD");

    const Deadline = moment(deadLine).format("YYYY/MM/DD");

    const JobDocument = await uploadJobDoc(document);

    //YYYY-MM-DD HH:mm:ss
    if (JobDocument) {
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
            experience,
            expiry_date: Deadline
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
        connection.query("SELECT * FROM jobs WHERE emp_id=? ORDER BY id DESC", [id], (err, result) => {
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
        let status = 'new';
        connection.query("SELECT * FROM applications WHERE job_id=? AND status=?", [jobId, status], (err, result) => {
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
            let status = 'viewed';
            connection.query("UPDATE applications SET status=? WHERE id=?", [status, userId], (err, results) => {
              if (err) console.log("querryError", err);
              else {
                res.send({
                  status: 200,
                  data: { applicant: result }
                });
              }
              connection.release();
            });
          }
        });
      }
    });
  }

  static expireDate(req, res) {

    const { jobId } = req.query;
    let postionNumber, newPositions;

    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT * FROM jobs WHERE id=?", [jobId], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            const { job_category } = result[0];
            connection.query("SELECT * from job_category WHERE category_name=?", [job_category], (err, results) => {
              if (err) console.log("querryError", err);
              else {
                const { positions } = results[0];
                positions === null ? postionNumber = 0 : postionNumber = positions;
                newPositions = parseInt(postionNumber) - 1;

                connection.query("UPDATE job_category SET positions=? WHERE category_name=?", [newPositions, job_category], (err, resultss) => {
                  if (err) console.log("QuerryError", err);
                  else {
                    connection.query("DELETE FROM jobs WHERE id=?", [jobId], (err, resultz) => {
                      if (err) console.log("QuerryError", err);
                      else {
                        res.send({
                          status: 200,
                          message: "Job removed succesfully"
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
    });
  }

  static empViewNumberOfJobs(req, res) {
    const { id } = req.user;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT COUNT(*) AS alljobs  FROM jobs WHERE emp_id=?", [id], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: result
            });
          }
          connection.release();
        });
      }
    });
  }
  static empViewAllApplicants(req, res) {
    const { id } = req.user;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT COUNT(*) AS allApp  FROM applications WHERE emp_id=?", [id], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: result
            });
          }
          connection.release();
        });
      }
    });
  }

  static empSeeNotViewedApplications(req, res) {
    const { id } = req.user;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        let status = 'new';
        connection.query("SELECT COUNT(*) AS allnotviewed  FROM applications WHERE emp_id=? AND status=?", [id, status], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: result
            });
          }
          connection.release();
        });
      }
    });
  }

  static empSeeNewApplications(req, res) {
    const { id } = req.user;

    const Dates = new Date();
    const date = Dates.toLocaleDateString();
    const Today = moment(date).format("DD/MM/YYYY");


    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT COUNT(*) AS allnew  FROM applications WHERE emp_id=? AND date=?", [id, Today], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: result
            });
          }
          connection.release();
        });
      }
    });
  }

  static empSeeSelectedApplications(req, res) {
    const { id } = req.user;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        let selected = 'true';
        connection.query("SELECT COUNT(*) AS allselected  FROM applications WHERE emp_id=? AND selected=?", [id, selected], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: result
            });
          }
          connection.release();
        });
      }
    });
  }

  static empViewAllApplicantsList(req, res) {
    const { id } = req.user;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT * FROM applications WHERE emp_id=? ORDER BY id DESC", [id], (err, result) => {
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

  static empSeeNotSeenApplicationsList(req, res) {
    const { id } = req.user;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        let status = 'new';
        connection.query("SELECT *  FROM applications WHERE emp_id=? AND status=? ORDER BY id DESC", [id, status], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { notSeenApplicants: result }
            });
          }
          connection.release();
        });
      }
    });
  }

  static empSeeNewApplicationsList(req, res) {
    const { id } = req.user;
    const Dates = new Date();
    const date = Dates.toLocaleDateString();
    const Today = moment(date).format("DD/MM/YYYY");
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT * FROM applications WHERE emp_id=? AND date=? ORDER BY id DESC", [id, Today], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { newApplicants: result }
            });
          }
          connection.release();
        });
      }
    });
  }

  static empSeeSelectedApplicationsList(req, res) {
    const { id } = req.user;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        let selected = 'true';
        connection.query("SELECT *  FROM applications WHERE emp_id=? AND selected=? ORDER BY id DESC", [id, selected], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { selectedApplicants: result }
            });
          }
          connection.release();
        });
      }
    });
  }

  static EmpJobCategories(req, res) {
    const { id } = req.user;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT id,job_category FROM jobs WHERE emp_id=?", [id], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: result
            });
          }
          connection.release();
        });
      }
    });
  }

  static FilterCategories(req, res) {
    const { id } = req.user;
    const { category } = req.query;

    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT * FROM jobs WHERE emp_id=? AND job_category=?", [id, category], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { jobs: result }
            });
          }
          connection.release();
        });
      }
    });

  }

  static EmpJobTitles(req, res) {
    const { id } = req.user;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT id,job_title FROM applications WHERE emp_id=?", [id], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: result
            });
          }
          connection.release();
        });
      }
    });
  }

  static FilterJobTitles(req, res) {
    const { id } = req.user;
    const { Title } = req.query;

    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT * FROM applications WHERE emp_id=? AND job_title=?", [id, Title], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { applications: result }
            });
          }
          connection.release();
        });
      }
    });
  }

  static FilterJobsSelectedApplicants(req, res) {
    const { id } = req.user;
    const { Title } = req.query;

    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        let selected = 'true';
        connection.query("SELECT * FROM applications WHERE (emp_id=? AND job_title=?)AND selected=?", [id, Title, selected], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { selectedApplications: result }
            });
          }
          connection.release();
        });
      }
    });
  }

  static FilterJobsNotViewedApplicants(req, res) {
    const { id } = req.user;
    const { Title } = req.query;

    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        let Status = 'new';
        connection.query("SELECT * FROM applications WHERE (emp_id=? AND job_title=?)AND status=?", [id, Title, Status], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { notViewedApplications: result }
            });
          }
          connection.release();
        });
      }
    });
  }

  static FilterJobsNewApplicants(req, res) {
    const { id } = req.user;
    const { Title } = req.query;

    const Dates = new Date();
    const date = Dates.toLocaleDateString();
    const Today = moment(date).format("DD/MM/YYYY");

    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT * FROM applications WHERE (emp_id=? AND job_title=?)AND date=?", [id, Title, Today], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: { NewApplications: result }
            });
          }
          connection.release();
        });
      }
    });
  }

  static selectApplicant(req, res) {
    const { userId } = req.query;

    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        let state = 'true';
        connection.query("UPDATE applications SET selected=? WHERE id =?", [state, userId], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              message: "Selected OK"
            });
          }
          connection.release();
        });
      }
    });
  }

  static empCountNbrOfApplicantForOneJob(req, res) {
    const { jobId } = req.query;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT COUNT(*) AS jobApplicants FROM applications WHERE job_id=?", [jobId], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: result
            });
          }
          connection.release();
        });
      }
    });
  }

  static empCountNbrOfUnSeenApplicantForOneJob(req, res) {
    const { jobId } = req.query;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        let status = 'new';
        connection.query("SELECT COUNT(*) AS unSeenApplicants FROM applications WHERE job_id=? AND status=?", [jobId, status], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: result
            });
          }
          connection.release();
        });
      }
    });
  }

  static empCountNbrOfSelectedApplicantForOneJob(req, res) {
    const { jobId } = req.query;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        let selected = 'true';
        connection.query("SELECT COUNT(*) AS selectedApplicants FROM applications WHERE job_id=? AND selected=?", [jobId, selected], (err, result) => {
          if (err) console.log("querryError", err);
          else {
            res.send({
              status: 200,
              data: result
            });
          }
          connection.release();
        });
      }
    });
  }








}