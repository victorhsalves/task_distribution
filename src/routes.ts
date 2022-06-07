import { Router } from "express";
import { TaskController } from "./controllers/TaskController";
import { UserController } from "./controllers/UserController";
import { AuthController } from "./controllers/AuthController"

const router = Router();

router.get('/teste', new TaskController().getAssigments)

router.get('/tasks/:uf?', new AuthController().ValidateJwt, new TaskController().getAll)
router.get('/getUsers', new UserController().getUser)


router.post('/login', new AuthController().DoLogin)
router.post('/logout', new AuthController().DoLogout)
router.post('/createAssignment', new TaskController().assingnToUserManually)
router.post('/multiAssignment', new TaskController().multiAssingment)
router.post('/createUser', new UserController().createUser)

router.delete('/deleteAssignment/:assignmentId', new AuthController().ValidateJwt, new TaskController().deleteAssignment)

export { router }