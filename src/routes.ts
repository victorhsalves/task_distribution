import { Router } from "express";
import { TaskController } from "./controllers/TaskController";
import { UserController } from "./controllers/UserController";

const router = Router();

router.get('/teste', () => {
    console.log('Testado')
    return 'Testado'
})
router.get('/tasks/:uf?', new TaskController().getAll)

router.post('/createUser', new UserController().createUser)

router.get('/getUsers', new UserController().getUser)

router.post('/createAssignment', new TaskController().assingnToUserManually)

router.post('/multiAssignment', new TaskController().multiAssingment)

export { router }