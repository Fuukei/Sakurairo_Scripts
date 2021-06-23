/**
 * @license 🥚
 * @author KotoriK
 */
import { Dinnerbone, payRespect, ilidilid } from './style'
const noop = () => { }
const answer_to_everything = () => 42
const _call_name_map = (async () =>
    new Map<string | number, (trigger?: boolean) => void>(
        [
            [404, noop],
            [114514, noop],
            ['_jeb', noop],
            ['Dinnerbone', Dinnerbone],
            ['pay_respect', payRespect],
            ['🐴', noop],
            ['SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED', () => 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED'],
            ['ilidilid', ilidilid],
            ['answer to everything', answer_to_everything]
        ]
    )
)()
export default async function sys_call(call_name: string | number) {
    const func = (await _call_name_map).get(call_name)
    if (func) {
        return func(true)
    } else {
        throw 'call_name unknown'
    }
}