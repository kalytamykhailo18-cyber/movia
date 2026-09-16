import 'dotenv/config'
import { spawn } from 'node:child_process'

const mode = process.argv[2] === 'start' ? 'start' : 'dev'
const port = process.env.APP_PORT ?? '3100'
const bin = process.platform === 'win32' ? 'next.cmd' : 'next'

const child = spawn(bin, [mode, '-p', port], { stdio: 'inherit', shell: process.platform === 'win32' })
child.on('exit', (code) => process.exit(code ?? 0))
