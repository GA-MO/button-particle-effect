import { useDemoList, useCreateDemo } from '../../datas/demo/hooks'
import { Button, Checkbox, Group, Select, TextInput } from '@mantine/core'
import type { ComboboxItem } from '@mantine/core'
import { isNotEmpty, useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'

type FormValues = {
  phone: string
  email: string
  termsOfService: boolean
  item: string
}

export default function Form() {
  const item = useDemoList({ limit: 10 })
  const create = useCreateDemo()

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      phone: '',
      email: '',
      termsOfService: false,
      item: '1'
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
    validate: {
      phone: isNotEmpty('Phone is required'),
      email: isNotEmpty('Email is required'),
      termsOfService: isNotEmpty('You must accept terms of use'),
      item: isNotEmpty('You must select an item')
    }
  })

  const data: ComboboxItem[] =
    item.data?.map((item) => ({ label: item.name, value: item.id.toString() })) || []

  const handleSubmit = async (values: FormValues) => {
    const body = {
      id: 0,
      name: values.email
    }
    create.mutate(body, {
      onSuccess: () => {
        form.reset()
        notifications.show({
          title: 'Success',
          message: 'Your form has been submitted',
          position: 'top-center'
        })
      }
    })
  }

  return (
    <div>
      <div className='mt-20 flex flex-col items-center justify-center'>
        <h1 className='mb-4 text-3xl font-bold'>Form</h1>
        <form onSubmit={form.onSubmit(handleSubmit)} className='w-full max-w-md'>
          {data.length > 0 && (
            <Select
              data-testid='item'
              withAsterisk
              label='Select'
              placeholder='Pick value'
              key={form.key('item')}
              data={data}
              checkIconPosition='right'
              nothingFoundMessage='Nothing found...'
              mb='md'
              {...form.getInputProps('item')}
            />
          )}

          <TextInput
            data-testid='phone'
            withAsterisk
            label='Phone'
            placeholder='Phone'
            key={form.key('phone')}
            mb='md'
            {...form.getInputProps('phone')}
          />

          <TextInput
            data-testid='email'
            withAsterisk
            label='Email'
            placeholder='your@email.com'
            key={form.key('email')}
            mb='md'
            {...form.getInputProps('email')}
          />

          <Checkbox
            data-testid='termsOfService'
            label='I agree to sell my privacy'
            key={form.key('termsOfService')}
            {...form.getInputProps('termsOfService', { type: 'checkbox' })}
          />

          <Group mt='md'>
            <Button
              type='submit'
              fullWidth
              disabled={!form.isValid()}
              loading={create.isPending}
              data-testid='submit'
            >
              Submit
            </Button>
          </Group>
        </form>
      </div>
    </div>
  )
}
