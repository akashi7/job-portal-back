import { Router } from "express";
import userController from "../controllers/user";
import validation from "../middleware/validation";
import isLoggedIn from "../middleware/isLoggedIn";
import fileUpload from "express-fileupload";

const userRouter = Router();


userRouter.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    debug: true,
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
    abortOnLimit: true,
    responseOnLimit: 'File too large',
  })
);

userRouter.patch("/updatePassword",
  isLoggedIn.isEmployerLoggedIn,
  validation.updatePassValidation,
  userController.userUpdatePassword);

userRouter.post("/postJob",
  isLoggedIn.isEmployerLoggedIn,
  validation.postJobValidation,
  userController.empPostJob);

userRouter.get("/viewAllJobs",
  isLoggedIn.isEmployerLoggedIn,
  userController.empViewAllHisJobs);

userRouter.get('/oneJob', isLoggedIn.isEmployerLoggedIn, userController.viewOneJob);
userRouter.get('/allApplicants', isLoggedIn.isEmployerLoggedIn, userController.viewApplicants);
userRouter.get('/oneApplicant', isLoggedIn.isEmployerLoggedIn, userController.viewOneApplicant);
userRouter.delete("/removeJob", isLoggedIn.isEmployerLoggedIn, userController.expireDate);
userRouter.get('/applicantsList', isLoggedIn.isEmployerLoggedIn, userController.empViewAllApplicantsList);
userRouter.get("/selectedApplicants", isLoggedIn.isEmployerLoggedIn, userController.empSeeSelectedApplicationsList);
userRouter.get('/notviewedApplicants', isLoggedIn.isEmployerLoggedIn, userController.empSeeNotSeenApplicationsList);
userRouter.get('/newApplicants', isLoggedIn.isEmployerLoggedIn, userController.empSeeNewApplicationsList);
userRouter.get("/numberOfJobs", isLoggedIn.isEmployerLoggedIn, userController.empViewNumberOfJobs);
userRouter.get("/numberOfApplicants", isLoggedIn.isEmployerLoggedIn, userController.empViewAllApplicants);
userRouter.get("/numberOfSelected", isLoggedIn.isEmployerLoggedIn, userController.empSeeSelectedApplications);
userRouter.get("/numberOfNotviewedApplicants", isLoggedIn.isEmployerLoggedIn, userController.empSeeNotViewedApplications);
userRouter.get("/numberOfNewApplicants", isLoggedIn.isEmployerLoggedIn, userController.empSeeNewApplications);
userRouter.get("/jobCategories", isLoggedIn.isEmployerLoggedIn, userController.EmpJobCategories);
userRouter.post("/filtercategory", isLoggedIn.isEmployerLoggedIn, userController.FilterCategories);
userRouter.get("/jobTitles", isLoggedIn.isEmployerLoggedIn, userController.EmpJobTitles);
userRouter.post("/filterJobsApplications", isLoggedIn.isEmployerLoggedIn, userController.FilterJobTitles);
userRouter.post("/filterSelectedJobsApplications", isLoggedIn.isEmployerLoggedIn, userController.FilterJobsSelectedApplicants);
userRouter.post("/filterNotSeenJobsApplications", isLoggedIn.isEmployerLoggedIn, userController.FilterJobsNotViewedApplicants);
userRouter.post("/filterNewJobsApplications", isLoggedIn.isEmployerLoggedIn, userController.FilterJobsNewApplicants);
userRouter.patch("/selectApplicant", isLoggedIn.isEmployerLoggedIn, userController.selectApplicant);
userRouter.get("/nOfOneJobApplicants", isLoggedIn.isEmployerLoggedIn, userController.empCountNbrOfApplicantForOneJob);
userRouter.get("/nOfOneJobUnseenApplicants", isLoggedIn.isEmployerLoggedIn, userController.empCountNbrOfUnSeenApplicantForOneJob);
userRouter.get("/nOfOneJobSelectedApplicants", isLoggedIn.isEmployerLoggedIn, userController.empCountNbrOfSelectedApplicantForOneJob);

export default userRouter;