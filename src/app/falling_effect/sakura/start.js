import { start } from "./sakura"

const amount = mashiro_option.effect.amount
let sakura_num
switch (amount) {
    case 'half':
        sakura_num = 25
        break
    case 'less':
        sakura_num = 15
        break
    case 'quarter':
        sakura_num = 35
        break
    case 'native':
        sakura_num = 50
        break
    default:
        sakura_num = parseInt(amount)
        if (isNaN(sakura_num)) {
            console.error('wrong arg')
            sakura_num = 50
        }
}
start(sakura_num)