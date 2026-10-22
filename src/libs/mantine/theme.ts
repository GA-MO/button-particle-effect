import { colorsTuple, createTheme } from '@mantine/core'

import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

const primary = colorsTuple('#4389f6')
const secondary = colorsTuple('#333333')
const fontFamily = 'Noto Sans Thai, sans-serif'
// const headingsFontFamily = 'Greycliff CF, sans-serif'

export const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    primary,
    secondary
  },
  white: '#ffffff',
  black: '#000000',
  defaultRadius: 'md',
  fontFamily,
  headings: {
    // fontFamily: headingsFontFamily
  },

  fontSmoothing: true,
  cursorType: 'pointer',
  focusRing: 'never'
})
