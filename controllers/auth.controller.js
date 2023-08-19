import { userRegistration, userLogin, userValidation, getUserData } from "../services/auth.service.js";

const login = async (req, res) => {
  userLogin(req.body,(isSuccess,data)=>{
     if (isSuccess) {
        res.cookie("access_token", data.accessToken, {
          httpOnly: true,
        });
       res.status(200).send(data);
     }else{
        res.status(403).send(data);
     }
  })
};

const registration = async (req, res) => {
  userRegistration(req.body, (isSuccess, data) => {
    if (isSuccess) {
      res.status(200).send(data);
    }
  });
};

const validate = async(req, res) => {
  userValidation(req.body, (isSuccess, data) => {
    if (isSuccess) {
      res.status(200).send(data);
    }else{
       res.status(403).send(data);
    }
  });
}

const getUser = async(req,res) => {
  const authHeader = req.headers["authorization"];
   const token = authHeader && authHeader.split(" ")[1];
    getUserData(token, (isSuccess, data) => {
      if (isSuccess) {
        res.status(200).send(data);
      } else {
        res.status(403).send(data);
      }
    });

}

export { registration, login, validate, getUser };
