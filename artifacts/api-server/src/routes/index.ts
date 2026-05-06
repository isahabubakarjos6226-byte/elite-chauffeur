import { Router, type IRouter } from "express";
import healthRouter from "./health";
import carsRouter from "./cars";
import driversRouter from "./drivers";
import reservationsRouter from "./reservations";
import pricingRouter from "./pricing";
import dashboardRouter from "./dashboard";
import distanceRouter from "./distance";
import settingsRouter from "./settings";
import adminAuthRouter from "./admin-auth";
import uploadRouter from "./upload";
import servicesRouter from "./services";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/cars", carsRouter);
router.use("/drivers", driversRouter);
router.use("/reservations", reservationsRouter);
router.use("/pricing", pricingRouter);
router.use("/dashboard", dashboardRouter);
router.use("/distance", distanceRouter);
router.use("/settings", settingsRouter);
router.use("/admin", adminAuthRouter);
router.use("/upload", uploadRouter);
router.use("/services", servicesRouter);
router.use("/users", usersRouter);

export default router;
