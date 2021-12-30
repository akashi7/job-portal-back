import { appSchema } from "../models/appModel";

export default class validation {


  static registerValidation(req, res, next) {
    const { full_names, company, phone, email } = req.body;
    const { error } = appSchema.empRegister.validate({ full_names, company, phone, email });
    if (error) {
      res.send({
        status: 409,
        error: error.message
      });
    }
    else next();
  }


  static loginValidation(req, res, next) {
    const { username, password } = req.body;
    const { error } = appSchema.empLogin.validate({ username, password });
    if (error) {
      res.send({
        status: 409,
        error: error.message
      });
    }
    else next();
  }

  static updatePassValidation(req, res, next) {
    const { password } = req.body;
    const { error } = appSchema.updatePassword.validate({ password });
    if (error) {
      res.send({
        status: 409,
        error: error.message
      });
    }
    else next();
  }

  static postJobValidation(req, res, next) {
    const { jobCategory, jobType, jobTitle, description, experience } = req.body;
    const { error } = appSchema.postJob.validate({ jobCategory, jobType, jobTitle, description, experience });
    if (error) {
      res.send({
        status: 409,
        error: error.message
      });
    }
    else next();
  }

  static applyJobValidation(req, res, next) {
    const { fullNames, email, phone, experience } = req.body;
    const { error } = appSchema.postApplication.validate({ fullNames, email, phone, experience });
    if (error) {
      res.send({
        status: 409,
        error: error.message
      });
    }
    else next();
  }
}