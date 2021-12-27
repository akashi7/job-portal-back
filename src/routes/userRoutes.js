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







export default userRouter;