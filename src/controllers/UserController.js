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
exports.UserController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserController {
    // async grantAccess(action: String, resource: String, req: Request, res: Response , next: NextFunction) {
    //     const { role } = req.body;
    //     try {
    //         const permission = Roles.can(role)[action](resource);
    //         if (!permission.granted) {
    //             return res.status(401).json({
    //                 error: "You don't have enough permission to perform this action"
    //             });
    //         }
    //         next()
    //     } catch (error) {
    //         next(error)
    //     }
    // }
    createUser(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password, cpf, name, birth_date, supervisor_id, profile_id } = request.body;
            const user = yield prisma_1.default.users.findFirst({
                where: {
                    OR: [{
                            username: username
                        },
                        {
                            cpf: cpf
                        }
                    ]
                }
            });
            if (user) {
                return response.status(200).json({ message: 'Usuário já cadastrado!' });
            }
            else {
                const salt = yield bcrypt_1.default.genSalt(6);
                const hashedPwd = yield bcrypt_1.default.hash(password, salt);
                yield prisma_1.default.users.create({
                    data: {
                        username: username,
                        password: hashedPwd,
                        cpf: cpf,
                        name: name,
                        birth_date: new Date(birth_date),
                        supervisor_id: supervisor_id,
                        profile_id: profile_id
                    }
                }).then(() => {
                    return response.status(200).json(user);
                }).catch((err) => {
                    console.log(err);
                    return response.status(500).json({ message: 'Erro ao criar usuário!', erro: err });
                });
            }
        });
    }
    getUser(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, cpf } = request.query;
            const users = yield prisma_1.default.users.findMany({
                where: {
                    OR: [{
                            cpf: cpf === null || cpf === void 0 ? void 0 : cpf.toString()
                        },
                        {
                            username: username === null || username === void 0 ? void 0 : username.toString()
                        }]
                },
                select: {
                    username: true,
                    cpf: true,
                    name: true,
                    supervisor_id: true,
                    profile: {
                        select: {
                            name: true
                        }
                    },
                    users: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            if (users) {
                return response.status(200).json(users);
            }
            else {
                return response.status(404).json('no users found!');
            }
        });
    }
    setAvailability(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userList, availability } = request.body;
            console.log('body');
            console.log(userList);
            console.log(availability);
            if (availability == true) {
                try {
                    const updatedUserLogin = yield prisma_1.default.userLogin.updateMany({
                        where: {
                            id: {
                                in: userList
                            }
                        },
                        data: {
                            available: 1
                        }
                    });
                    console.log('ok false');
                    return response.status(200).json({ message: 'Usuários agora estão disponíveis!' });
                }
                catch (error) {
                    console.log(error);
                    return response.status(500).json({ error: error });
                }
            }
            else if (availability == false) {
                try {
                    const updatedUserLogin = yield prisma_1.default.userLogin.updateMany({
                        where: {
                            id: {
                                in: userList
                            }
                        },
                        data: {
                            available: 0
                        }
                    });
                    console.log('ok false');
                    return response.status(200).json({ message: 'Usuários agora estão indisponíveis!' });
                }
                catch (error) {
                    console.log(error);
                    return response.status(500).json({ error: error });
                }
            }
            else {
                console.log('algo errado');
            }
        });
    }
}
exports.UserController = UserController;
