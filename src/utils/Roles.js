"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = void 0;
const accesscontrol_1 = require("accesscontrol");
const ac = new accesscontrol_1.AccessControl();
const Roles = (() => {
    ac.grant('admin')
        .createAny('assignment');
    return ac;
})();
exports.Roles = Roles;
