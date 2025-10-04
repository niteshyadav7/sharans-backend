import jwt from "jsonwebtoken";



// hardcoded secret key for now
export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, "hello my name is nitesh yadav", {
    expiresIn: "7d",
  });
};
