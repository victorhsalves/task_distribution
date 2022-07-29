"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class TaskController {
    test(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const q = request.query;
            const p = request.params;
            const b = request.body;
            console.log(q);
            console.log(p);
            console.log(b);
        });
    }
    getAll(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { taskType, username } = request.query;
            if (taskType) {
                const tasks = yield prisma_1.default.task.findMany({
                    where: {
                        type_id: parseInt(taskType.toString()),
                    }
                });
                return response.json(tasks);
            }
            else {
                const tasks = yield prisma_1.default.task.findMany({});
                return response.json(tasks);
            }
        });
    }
    getTasksBySupervisor(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = request.query;
            if (username) {
                const tasks = yield prisma_1.default.task.findMany({
                    where: {
                        type_id: parseInt(username.toString())
                    }
                });
                return response.json(tasks);
            }
            else {
                const tasks = yield prisma_1.default.task.findMany({});
                return response.json(tasks);
            }
        });
    }
    getTask(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { task_id } = request.query;
            console.log(request.query);
            console.log(request.params);
            if (task_id) {
                const task = yield prisma_1.default.task.findUnique({
                    where: {
                        id: parseInt(task_id.toString()),
                    },
                    include: {
                        taskType: {
                            select: {
                                description: true
                            }
                        }
                    }
                });
                console.log(task);
                return response.status(200).json(task);
            }
            return response.status(404).json({ message: 'Tarefa não encontrada!' });
        });
    }
    getMyTasks(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = request.params;
            if (username) {
                const tasks = yield prisma_1.default.task.findMany({
                    where: {
                        assignments: {
                            some: {
                                users: {
                                    username: username
                                }
                            }
                        }
                    }
                });
                const assignments = yield prisma_1.default.assignments.findMany({
                    where: {
                        users: {
                            username: username.toString()
                        }
                    },
                    select: {
                        task: true
                    }
                    // include: {
                    //     task: true,
                    //     users: {
                    //         select: {
                    //             name: true,
                    //             username: true,
                    //             profile: {
                    //                 select: {
                    //                     name: true
                    //                 }
                    //             }
                    //         }
                    //     }
                    // }
                });
                return response.status(200).json(tasks);
            }
            return response.status(404).json({ message: 'Falha ao buscar tarefas!' });
        });
    }
    getTypes(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const types = yield prisma_1.default.taskType.findMany();
            if (types) {
                return response.status(200).json(types);
            }
            else {
                return response.status(404).json({ error: 'Nenhum tipo encontrado' });
            }
        });
    }
    assingnToUserManually(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, taskId } = request.body;
            const date = new Date();
            const user = yield prisma_1.default.users.findFirst({
                where: {
                    username: username
                },
                select: {
                    id: true
                }
            });
            const assignment = yield prisma_1.default.assignments.findFirst({
                where: {
                    task_id: taskId
                }
            });
            if (user != null && assignment == null) {
                yield prisma_1.default.assignments.create({
                    data: {
                        user_id: user.id,
                        task_id: taskId,
                        assignment_date: date,
                        start_date: null,
                        final_date: null
                    }
                }).then(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield prisma_1.default.task.update({
                            where: {
                                id: taskId
                            },
                            data: {
                                assigned: 1
                            }
                        }).then(() => {
                            return response.status(200).json({
                                user_id: user.id,
                                task_id: taskId,
                                assignment_date: date,
                                start_date: null,
                                final_date: null
                            });
                        }).catch((error) => {
                            return response.status(500).json({ error: error });
                        });
                    });
                }).catch((error) => {
                    return response.status(401).json({ error: error });
                });
            }
            else {
                return response.status(200).json({
                    message: 'Não foi possível atribuir a atividade!'
                });
            }
        });
    }
    multiAssingment(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { usernames } = request.body;
            const users = yield prisma_1.default.users.findMany({
                where: {
                    username: {
                        in: usernames
                    }
                }
            }).catch((error) => {
                return response.status(500).json(error);
            });
            return response.status(200).json(users);
        });
    }
    autoAssignment(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { profile, supervisorId, taskTypeId, tasksPerUser } = request.body;
            console.log(profile);
            console.log(supervisorId);
            console.log(taskTypeId);
            // coletar todas as tarefas não atribuídas do dado tipo
            const tasks = yield prisma_1.default.task.findMany({
                where: {
                    assigned: 0,
                    type_id: taskTypeId
                },
                orderBy: {
                    request_date: 'desc'
                }
            });
            console.log(tasks.length);
            // coletar usuários disponíveis para receber tarefas
            const availableUsers = yield prisma_1.default.userLogin.findMany({
                where: {
                    available: 1,
                    users: {
                        profile: {
                            name: profile
                        },
                        users: {
                            username: supervisorId
                        },
                        userSkill: {
                            some: {
                                task_type_id: taskTypeId
                            }
                        }
                    },
                    session_date: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)
                    }
                }
            });
            console.log(availableUsers);
            // selecionadas as tarefas que serão atribuídas de acordo com a qtd máx e qtd de users
            const maxCounting = availableUsers.length * tasksPerUser;
            const tasksToAssign = tasks.slice(0, maxCounting);
            // criação da atribuição (task - user)
            let index = 0;
            availableUsers.forEach(user => {
                let userTasks = tasksToAssign.slice(index * tasksPerUser, (index + 1) * tasksPerUser);
                userTasks.forEach((userTask) => __awaiter(this, void 0, void 0, function* () {
                    // criar assignments
                    yield prisma_1.default.assignments.create({
                        data: {
                            user_id: user.user_id,
                            task_id: userTask.id,
                            assignment_date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()),
                        }
                    }).then(() => {
                        response.status(200);
                    }).catch((error) => {
                        console.log(error);
                    });
                    // update da tarefa para atribuição = 1
                    yield prisma_1.default.task.update({
                        where: {
                            id: userTask.id
                        },
                        data: {
                            assigned: 1
                        }
                    }).then(() => {
                        console.log('Tarefa atualizada após atribuição');
                    }).catch((error) => {
                        console.log(error);
                    });
                }));
                console.log(userTasks);
                index++;
            });
            return response.status(200).json('Ok!');
        });
    }
    deleteAssignment(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { assignmentId } = request.body;
            yield prisma_1.default.assignments.delete({
                where: {
                    id: assignmentId
                }
            }).then(() => {
                return response.status(200).json({ message: 'Atribuição deletada com sucesso!' });
            }).catch((err) => {
                return response.status(500).json({ message: 'Erro ao deletar atribuição!', erro: err });
            });
        });
    }
    getSquadTasks(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username } = request.params;
            if (username) {
                const tasks = yield prisma_1.default.task.findMany({
                    where: {
                        assignments: {
                            some: {
                                users: {
                                    users: {
                                        username: username
                                    }
                                }
                            }
                        }
                    }
                });
                console.log(tasks);
                return response.status(200).json(tasks);
            }
            else {
                return response.status(500).json({ error: "Informe um usuário!" });
            }
        });
    }
}
exports.TaskController = TaskController;
