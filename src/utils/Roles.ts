import { AccessControl } from 'accesscontrol'
const ac = new AccessControl();

const Roles = (() => {
    ac.grant('admin')
    .createAny('assignment')

    return ac
})();

export { Roles }