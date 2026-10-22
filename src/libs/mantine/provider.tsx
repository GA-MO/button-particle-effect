import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'

import { theme } from './theme'
import { AppErrorModal, MODAL_APPLICATION_ERROR } from './AppErrorModal'

export default function Provider(props: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <ModalsProvider modals={{ [MODAL_APPLICATION_ERROR]: AppErrorModal }}>
        {props.children}
      </ModalsProvider>
    </MantineProvider>
  )
}
