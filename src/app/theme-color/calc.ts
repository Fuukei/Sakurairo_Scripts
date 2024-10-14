import { neuquant } from '@kotorik/palette'

export default function neuquantCalc(data:Uint8ClampedArray){
    const { label, centroid } = neuquant(data, 8)
    const max = Math.max(...label)
    const index = label.findIndex(value => value == max)
    return centroid[index]
}