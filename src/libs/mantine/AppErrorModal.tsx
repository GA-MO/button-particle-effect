import { Text, Button, Title, Space } from '@mantine/core'
import type { ContextModalProps } from '@mantine/modals'

export const MODAL_APPLICATION_ERROR: string = 'applicationError'

interface AppErrorModalInnerProps {
  title: string
  message: string
}

export function AppErrorModal({
  context,
  id,
  innerProps
}: ContextModalProps<AppErrorModalInnerProps>) {
  return (
    <div className='text-center'>
      <Title order={3}>{innerProps.title}</Title>
      <Text size='sm'>{innerProps.message}</Text>
      <Space h='md' />
      <Button fullWidth onClick={() => context.closeModal(id)}>
        Close
      </Button>
    </div>
  )
}
