import { platform, arch } from 'process'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

function isMusl() {
    if (platform !== 'linux') return false

    if (process.report && typeof process.report.getReport === 'function') {
        const report = process.report.getReport()
        return !report?.header?.glibcVersionRuntime
    }

    return false
}

function loadPackage(pkgName) {
    try {
        return require(pkgName)
    } catch (e) {
        if (e && e.code !== 'MODULE_NOT_FOUND') {
            throw e
        }

        throw new Error(
            [
                `Failed to load native binding: ${pkgName}`,
                `platform=${platform}, arch=${arch}`,
                `Possible reasons:`,
                `1. platform package was not published`,
                `2. optionalDependencies were skipped`,
                `3. unsupported runtime environment`,
                `Original error: ${e.message}`
            ].join('\n')
        )
    }
}

function loadBinding() {
    if (platform === 'win32' && arch === 'x64') {
      return loadPackage('@wasm-sandbox/wasm-sandbox.win32-x64-msvc')
    }

    if (platform === 'win32' && arch === 'arm64') {
        return loadPackage('@wasm-sandbox/wasm-sandbox.win32-arm64-msvc')
    }

    if (platform === 'darwin' && arch === 'x64') {
        return loadPackage('@wasm-sandbox/wasm-sandbox.darwin-x64')
    }

    if (platform === 'darwin' && arch === 'arm64') {
        return loadPackage('@wasm-sandbox/wasm-sandbox.darwin-arm64')
    }

    if (platform === 'linux' && arch === 'x64') {
        return isMusl()
            ? loadPackage('@wasm-sandbox/wasm-sandbox.linux-x64-musl')
            : loadPackage('@wasm-sandbox/wasm-sandbox.linux-x64-gnu')
    }

    if (platform === 'linux' && arch === 'arm64') {
        return isMusl()
            ? loadPackage('@wasm-sandbox/wasm-sandbox.linux-arm64-musl')
            : loadPackage('@wasm-sandbox/wasm-sandbox.linux-arm64-gnu')
    }

    throw new Error(`Unsupported platform: ${platform}-${arch}`)
}

export default loadBinding()
