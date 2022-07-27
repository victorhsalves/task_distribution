import { Router } from "express";
import { TaskController } from "./controllers/TaskController";
import { UserController } from "./controllers/UserController";
import { AuthController } from "./controllers/AuthController"

const router = Router();

router.get('/teste/', new TaskController().test)

router.get('/getTypes', new TaskController().getTypes)
router.get('/getSquadTasks/:username', new TaskController().getSquadTasks)
router.get('/tasks/:uf?',  new TaskController().getAll)
router.get('/task/:task_id', new TaskController().getTask)
router.get('/getUsers',   new UserController().getUser)
router.get('/getLoggedUsers', new AuthController().getLoggedUsers)
router.get('/getMyTasks/:username', new TaskController().getMyTasks)


router.post('/login', new AuthController().doLogin)
router.post('/logout', new AuthController().doLogout)
router.post('/createAssignment', new TaskController().assingnToUserManually)
router.post('/multiAssignment', new TaskController().multiAssingment)
router.post('/autoAssignment',  new TaskController().autoAssignment)
router.post('/createUser', new UserController().createUser)
router.post('/setAvailability', new UserController().setAvailability)

router.delete('/deleteAssignment/:assignmentId',  new TaskController().deleteAssignment)

export { router }