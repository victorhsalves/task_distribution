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
exports.AuthController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthController {
    doLogin(request, response, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = request.body;
            console.log(username);
            console.log(password);
            const user = yield prisma_1.default.users.findFirst({
                where: {
                    username: username
                },
                include: {
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
            if (user != null) {
                if (yield bcrypt_1.default.compare(password, user.password)) {
                    if (!process.env.SECRET)
                        response.status(500).json({ message: 'Server could not decode token.' });
                    var secret = String(process.env.SECRET);
                    const token = jsonwebtoken_1.default.sign({
                        username: user.username,
                        profile: user.profile.name,
                        name: user.name,
                        supervisor: (_a = user.users) === null || _a === void 0 ? void 0 : _a.name
                    }, secret, {
                        expiresIn: '1 day' // expires in 5min
                    });
                    const userLogin = yield prisma_1.default.userLogin.findFirst({
                        where: {
                            users: {
                                username: user.username
                            },
                            session_date: {
                                gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)
                            }
                        }
                    });
                    if (!userLogin) {
                        yield prisma_1.default.userLogin.create({
                            data: {
                                user_id: user.id,
                                available: 1
                            }
                        });
                    }
                    console.log(response.cookie);
                    console.log(token);
                    return response.status(200).cookie('auth-token', 'Bearer ' + token, { expires: new Date(Date.now() + 50 * 60 * 1000) }).json({ auth: true, token: token });
                }
                return response.status(500).json({ message: 'Login inválido!' });
            }
        });
    }
    doLogout(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var token = request.body.headers['Authorization'];
            if (!token)
                return response.status(401).json({ auth: false, message: 'No token provided.' });
            token = token.substring(7);
            try {
                var decoded = jsonwebtoken_1.default.verify(token, String(process.env.SECRET));
                console.log(decoded);
                console.log(decoded.username);
                const login = yield prisma_1.default.userLogin.findFirst({
                    where: {
                        users: {
                            username: decoded.username
                        }
                    }
                });
                if (login) {
                    yield prisma_1.default.userLogin.delete({
                        where: {
                            id: login.id
                        }
                    });
                }
                return response.status(200).cookie('auth-token', '').json({ auth: false, token: '' });
            }
            catch (error) {
                response.status(401).json(error);
            }
        });
    }
    validateJwt(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var token = request.body.headers['Authorization'];
            console.log(token);
            if (!token)
                return response.status(401).json({ auth: false, message: 'No token provided.' });
            token = token.substring(7);
            try {
                var dec = jsonwebtoken_1.default.verify(token, String(process.env.SECRET));
                const permissions = yield prisma_1.default.userPermission.findFirst({
                    where: {
                        profile: {
                            name: dec.profile
                        }
                    }
                });
                console.log(dec);
                response.status(201);
                next();
            }
            catch (error) {
                response.status(401).json(error);
            }
        });
    }
    getLoggedUsers(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, profile } = request.query;
            console.log(request.params);
            console.log(request.query);
            console.log(username);
            console.log(profile);
            if (profile) {
                if (profile in ['ANALISTA', 'ADMIN']) {
                    const loggedUsers = yield prisma_1.default.userLogin.findMany({
                        where: {
                            session_date: {
                                gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)
                            }
                        },
                        include: {
                            users: {
                                select: {
                                    username: true,
                                    name: true
                                }
                            }
                        }
                    });
                    return response.status(200).json(loggedUsers);
                }
                else if (profile == 'SUPERVISOR' && username) {
                    const loggedUsers = yield prisma_1.default.userLogin.findMany({
                        where: {
                            session_date: {
                                gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)
                            },
                            users: {
                                users: {
                                    username: username.toString()
                                }
                            }
                        },
                        include: {
                            users: {
                                select: {
                                    username: true,
                                    name: true
                                }
                            }
                        }
                    });
                    return response.status(200).json(loggedUsers);
                }
            }
            else {
                return response.status(401).json('unauthorized');
            }
        });
    }
    checkRolePermission(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var token = request.headers.authorization;
            if (!token)
                return response.status(401).json({ auth: false, message: 'No token provided.' });
        });
    }
}
exports.AuthController = AuthController;
