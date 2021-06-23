/**
 * @license 🥚
 * @author KotoriK
 */
import { Dinnerbone, payRespect, ilidilid } from './style'
const noop = () => { }
const answer_to_everything = () => 42
const _call_name_map = new Map<string | number, () => void>(
        [
            [404, noop],
            [114514, noop],
            ['_jeb', noop],
            ['Dinnerbone', wrapper(Dinnerbone)],
            ['pay_respect', wrapper(payRespect)],
            ['🐴', noop],
            ['SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED', () => 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED'],
            ['ilidilid', wrapper(ilidilid)],
            ['answer to everything', answer_to_everything]
        ]
    )
function wrapper(func:(trigger: boolean) => void){
    let trigger_value = true
    return ()=>{
        func(trigger_value)
        trigger_value=!trigger_value
    }
}
export default function sys_call(call_name: string | number) {
    const func = _call_name_map.get(call_name)
    if (func) {
        return func
    } else {
        throw 'call_name unknown'
    }
}