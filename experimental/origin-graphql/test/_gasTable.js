import pubsub from '../src/utils/pubsub'

let subscriptionId = undefined
const used = {}

export async function trackGas(){
    subscriptionId = await pubsub.subscribe('TRANSACTION_UPDATED', data => {
        try{
            if(data.transactionUpdated == undefined) {
                return
            }
            if(data.transactionUpdated.status != 'receipt'){
                return
            }
            const { mutation, gasUsed } = data.transactionUpdated
            used[mutation] = used[mutation] ? used[mutation] : []
            used[mutation].push(gasUsed)
        } catch (e) {
            // Do nothing
        }
    })
}

export function showGasTable() {
    pubsub.unsubscribe(subscriptionId)
    console.log('')
    console.log('--------------------------------------------------')
    console.log('Gas used (max, min)')
    console.log('--------------------------------------------------')
    const keys = Object.keys(used).sort()
    keys.forEach(key => {
        const values = used[key].sort((a,b) => a - b)
        const min = values[0]
        const max = values[values.length-1]
        console.log([
            key.padEnd(18),
            max.toLocaleString().padStart(10),
            min.toLocaleString().padStart(10)
        ].join('\t'))
    })
}

