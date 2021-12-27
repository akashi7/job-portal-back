import { db } from "../config/database";
import { sign } from "jsonwebtoken";
import { hash, compare } from "bcryptjs";
import sendGrid from '@sendgrid/mail';



sendGrid.setApiKey(process.env.SENDGRID_API_KEY);


function makePassword(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

const sendPassword = makePassword(8);

export default class authController {

  static empRegister(req, res) {

    const { full_names, company, phone, email } = req.body;

    db.getConnection((err, connection) => {
      if (err) console.log("ConnectionError", err);
      else {
        connection.query("SELECT * FROM employers WHERE email=?", [email], (err, result) => {
          if (err) console.log("QuerryError", err);
          else if (result.length > 0) {
            res.send({
              status: 305,
              message: "User already registered"
            });
          }
          else {
            function getMessage() {
              const Body = `Dear ${full_names} Your Username is : ${email} <br> and Password is : ${sendPassword} <br>
              <br>
              Please keep your credentials safe for security reasons
              <br>
              `;
              return {
                to: email, // Change to your recipient
                from: 'akashichris7@gmail.com', // Change to your verified sender
                subject: 'Account credentials',
                text: Body,
                html: `<strong>${Body}</strong>`,
              };
            }

            async function sendMail() {
              try {
                await sendGrid.send(getMessage());
                let hashedPassword = await hash(sendPassword, 8);
                connection.query("INSERT INTO employers SET?", {
                  full_names,
                  company,
                  phone,
                  email,
                  password: hashedPassword
                }, (err, result) => {
                  if (err) console.log("QuerryError", err);
                  else {
                    res.send({
                      status: 200,
                      message: "Mesage sent ok"
                    });
                  }
                  connection.release();
                });
              } catch (error) {
                res.send({
                  status: 300,
                  message: "Error sending Email"
                });
              }
            }

            (async () => {
              await sendMail();
            })();
          }
        });
      }
    });

  }

  static empLogin(req, res) {

    const { username, password } = req.body;

    db.getConnection((err, connection) => {
      if (err) console.log("ConnectionError", err);
      else {
        connection.query("SELECT * FROM employers WHERE email=?", [username], async (err, result) => {
          if (err) console.log("QuerryError", err);
          else if (result.length === 0) {
            res.send({
              status: 300,
              message: "User doesn't exist"
            });
          }
          else {
            if (!(await compare(password, result[0].password))) {
              res.send({
                status: 301,
                message: "Password's do not match"
              });
            }
            else {
              let employer = '1';
              const { id, full_names, company, phone } = result[0];
              const token = sign({ id, full_names, company, phone, employer }, process.env.JWT_SECRET, { expiresIn: "10d" });
              res.send({
                status: 200,
                token
              });

            }
            connection.release();
          }
        });
      }
    });
  }

  static addCategories(req, res) {
    const { categoryName } = req.body;
    db.getConnection((err, connection) => {
      if (err) console.log("connectionError", err);
      else {
        connection.query("SELECT * FROM job_category WHERE category_name LIKE N? ", [`${categoryName}`], (err, result) => {
          if (err) console.log("querryError", err);
          else if (result.length > 0) {
            res.send({
              status: 300,
              message: "Category arleady exist"
            });
          }
          else {
            connection.query("INSERT INTO job_category SET?", {
              category_name: categoryName
            }, (err, result) => {
              if (err) console.log("querryError", err);
              else {
                res.send({
                  status: 200,
                  message: "Category registered"
                });
              }
            });
          }
        });
      }
    });
  }

}