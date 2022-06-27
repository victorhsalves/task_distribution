import { Router } from "express";
import { TaskController } from "./controllers/TaskController";
import { UserController } from "./controllers/UserController";
import { AuthController } from "./controllers/AuthController"

const router = Router();

router.get('/teste/',new AuthController().validateJwt, new TaskController().test)

router.get('/getTypes', new TaskController().getTypes)
router.get('/getAssignments/:username', new TaskController().getAssigments)
router.get('/tasks/:uf?', new AuthController().validateJwt, new TaskController().getAll)
router.get('/getUsers', new UserController().getUser)
router.get('/getLoggedUsers', new AuthController().getLoggedUsers)


router.post('/login', new AuthController().doLogin)
router.post('/logout', new AuthController().doLogout)
router.post('/createAssignment', new TaskController().assingnToUserManually)
router.post('/multiAssignment', new TaskController().multiAssingment)
router.post('/createUser', new UserController().createUser)

router.delete('/deleteAssignment/:assignmentId', new AuthController().validateJwt, new TaskController().deleteAssignment)

export { router }