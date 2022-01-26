import cloudinary from "../config/cloudinary";
import moment from "moment";
import { db } from "../config/database";




const uploadResume = async (doc) => {
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



export default class homeController {

  static viewJobsCategories(req, res) {
    db.getConnection((err, connection) => {
      if (err) console.log("ConnectionError", err);
      else {
        connection.query("SELECT * FROM job_category", (err, result) => {
          if (err) console.log("QuerryError", err);
          else {
            res.send({
              status: 200,
              data: { jobCategory: result }
            });
          }
          connection.release();
        });
      }
    });
  }

  static userViewCategory(req, res) {

    const { categoryName } = req.query;

    let date = new Date();
    let dateString = date.toLocaleDateString();

    let today = moment(dateString).format("YYYY/MM/DD");

    db.getConnection((err, connection) => {
      if (err) console.log("ConnectionError", err);
      else {
        connection.query("SELECT * FROM jobs WHERE  job_category =? AND expiry_date <= ? ORDER BY id DESC ", [categoryName, today], (err, result) => {
          if (err) console.log("QuerryError", err);
          else {
            res.send({
              status: 200,
              data: { categoryJobs: result }
            });
          }
          connection.release();
        });
      }
    });
  }

  static userViewJob(req, res) {
    const { id } = req.query;

    db.getConnection((err, connection) => {
      if (err) console.log("ConnectionError", err);
      else {
        connection.query("SELECT * FROM jobs WHERE id=?", [id], (err, result) => {
          if (err) console.log("QuerryError", err);
          else {
            res.send({
              status: 200,
              data: { OneJob: result }
            });
          }
          connection.release();
        });
      }
    });

  }

  static async userApplyJob(req, res) {

    const { id, emp_id, job_title } = req.query;

    const { fullNames, email, phone, experience } = req.body;
    const { resume = {} } = req.files;
    const today = new Date();
    const day = today.toLocaleDateString();
    const date = moment(day).format("DD/MM/YYYY");
    let status = 'new';
    let selected = 'false';

    const Resume = await uploadResume(resume);

    if (Resume) {
      db.getConnection((err, connection) => {
        if (err) console.log("ConnectionError", err);
        else {
          connection.query("INSERT INTO applications SET?", {
            applicant_name: fullNames,
            email,
            phone,
            resume: Resume,
            experience,
            date,
            job_id: id,
            status,
            emp_id,
            selected,
            job_title
          }, (err, result) => {
            if (err) console.log("QuerryError", err);
            else {
              res.send({
                status: 200,
                message: "Application sent succesfully"
              });
            }
            connection.release();
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


}