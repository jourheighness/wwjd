// The plugin's one hooks module: the /wwjd sidebar (decisions, Settings), and the status line and band.
import type { Register } from 'claude-code'

import { register as sidebar } from './sidebar'
import { register as status } from './status'

export const register: Register = (on, options) => {
  sidebar(on, options)
  status(on, options)
}
