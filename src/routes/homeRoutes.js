import { Router } from "express";
import homeController from "../controllers/home";
import fileUpload from "express-fileupload";
import validation from "../middleware/validation";


const homeRouter = Router();

homeRouter.use(
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


homeRouter.get("/jobsCategories", homeController.viewJobsCategories);
homeRouter.get('/viewAllJobs', homeController.userViewCategory);
homeRouter.get("/viewJob", homeController.userViewJob);
homeRouter.post('/applyJob', validation.applyJobValidation, homeController.userApplyJob);






export default homeRouter;