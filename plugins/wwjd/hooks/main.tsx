// The plugin's one hooks module: the /wwjd-dials pane and the status line and band.
import type { Register } from 'claude-code'

import { register as dials } from './dials'
import { register as status } from './status'

export const register: Register = (on, options) => {
  dials(on, options)
  status(on, options)
}
