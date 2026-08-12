import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library registers auto-cleanup only when vitest globals are enabled.
// Globals are off here (explicit imports are clearer), so unmount between tests
// ourselves — otherwise rendered trees accumulate and queries match elements
// left behind by earlier tests.
afterEach(cleanup)
