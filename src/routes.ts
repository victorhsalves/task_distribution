import { Router } from "express";
import { TaskController } from "./controllers/TaskController";
import { UserController } from "./controllers/UserController";
import { AuthController } from "./controllers/AuthController"

const router = Router();

router.get('/teste', () => {
    console.log('Testado')
    return 'Testado'
})
router.get('/tasks/:uf?', new AuthController().ValidateJwt, new TaskController().getAll)

router.post('/createUser', new UserController().createUser)

router.get('/getUsers', new UserController().getUser)

router.post('/createAssignment', new TaskController().assingnToUserManually)

router.post('/multiAssignment', new TaskController().multiAssingment)

router.post('/login', new AuthController().DoLogin)

export { router }