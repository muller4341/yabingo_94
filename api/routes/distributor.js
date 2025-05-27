import express from "express";

import {
  addDistributor,
  createDistributor,
  getRejectedDistributors,
  getPendingDistributors,
  updateDistributorApproval,
  updateRejectedToAccepted,
  createCustomer,
  getCustomers,
  getDistributorsByApprovalStatus,
} from "../controllers/distributor.js";
import verifyUser from "../utils/verifyUser.js";

const router = express.Router();

//router.post('/signup',signup )
router.post("/adddistributor", verifyUser, addDistributor);
router.get(
  "/getdistributorsbyapproval",
  verifyUser,
  getDistributorsByApprovalStatus
);
router.get("/getcustomers", verifyUser, getCustomers);
router.get("/getpendingdistributors", verifyUser, getPendingDistributors);
router.post("/createdistributor", verifyUser, createDistributor);
router.post("/createcustomer", verifyUser, createCustomer);
router.get("/getrejecteddistributors", verifyUser, getRejectedDistributors);
router.post("/update-approval", verifyUser, updateDistributorApproval);
router.post("/rejecttoaccepted", verifyUser, updateRejectedToAccepted);
export default router;
