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

    db.getConnection((err, connection) => {
      if (err) console.log("ConnectionError", err);
      else {
        connection.query("SELECT * FROM jobs WHERE  job_category =? ", [categoryName], (err, result) => {
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
              data: { jobDetails: result }
            });
          }
          connection.release();
        });
      }
    });

  }

  static async userApplyJob(req, res) {

    const { id } = req.query;

    const { fullNames, email, phone, resume = {}, experience, motivation } = req.body;
    const today = new Date();
    const day = today.toLocaleDateString();
    const date = moment(day).format("DD/MM/YYYY");
    let status = 'new';

    const Resume = await uploadResume(resume);

    if (Resume || !Resume) {
      db.getConnection((err, connection) => {
        if (err) console.log("ConnectionError", err);
        else {
          connection.query("INSERT INTO applications SET?", {
            applicant_name: fullNames,
            email,
            phone,
            resume: Resume,
            experience,
            motivation,
            date,
            job_id: id,
            status
          }, (err, result) => {
            if (err) console.log("QuerryError", err);
            else {
              res.send({
                status: 200,
                message: "Application sent succesfully"
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


}