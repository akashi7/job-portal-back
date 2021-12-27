import { verify } from "jsonwebtoken";
import { config } from 'dotenv';

config();

export default class isLoggedIn {

  static isEmployerLoggedIn(req, res, next) {

    const token = req.headers.authorization.replace("Bearer ", "");

    verify(token, `${process.env.JWT_SECRET}`, (err, decoded) => {
      if (err) res.send({ status: 401, mesage: "Login first" });
      else {
        const { employer } = decoded;
        if (employer !== '1') {
          res.send({ status: 401, mesage: "Login first" });
        }
        else {
          req.user = decoded;
          next();
        }
      }
    });

  }

}