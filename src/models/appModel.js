import Joi from "joi";

let string = Joi.string().required();

const appSchema = {

  empRegister: Joi.object({
    full_names: string.regex(/^[A-Za-z]/).max(100).min(5).error(new Error("Names must be letters only and not less than 5 char")),
    phone: string.regex(/^((07))[0-9]+$/).max(10).min(10).error(new Error("Telephone must be 10 numbers and start with 07")),
    company: string.error(new Error("Company is required")),
    email: string.email().error(new Error("Email is required and must be a valid Email"))
  }),

  empLogin: Joi.object({
    username: string.email().error(new Error("Username is required and must be a valid Email")),
    password: string.min(8).max(8).error(new Error("Password must be 8 char"))
  }),

  updatePassword: Joi.object({
    password: string.min(8).max(8).error(new Error("Password must be 8 char"))
  }),

  postJob: Joi.object({
    jobCategory: string.error(new Error("Job category is required")),
    jobType: string.error(new Error("Job title is required")),
    jobTitle: string.min(5).max(100).error(new Error("Job title is required")),
    description: string.min(5).max(100).error(new Error("Provide description")),
    experience: string.error(new Error("Experience is required"))
  }),

  postApplication: Joi.object({
    fullNames: string.regex(/^[A-Za-z]/).max(100).min(5).error(new Error("Names must be letters only and not less than 5 char")),
    email: string.email().error(new Error("Email is required and must be a valid Email")),
    phone: string.regex(/^((07))[0-9]+$/).max(10).min(10).error(new Error("Telephone must be 10 numbers and start with 07")),
    experience: string.error(new Error("Experience is required")),
    motivation: string.min(15).max(100).error(new Error("Provide mitivation and not less than 15 char"))
  })

};



export { appSchema };