export default function (apiPath: string, params: Record<string, string>={}, nonce: boolean = true) {
    const path = new URL(apiPath)
    const { searchParams } = path
    for (const [key, value] of Object.entries(params)) {
        searchParams.set(key, value)
    }
    if (nonce) searchParams.set("_wpnonce", Poi.nonce)
    return path.toString()
}