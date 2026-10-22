import { Button } from '@mantine/core'
import { useCounterStore } from '../../stores/counter'

export default function Store() {
  const { count, increase, decrease, reset } = useCounterStore()
  return (
    <div>
      <div className='mt-20 flex flex-col items-center justify-center'>
        <h1 className='mb-4 text-3xl font-bold'>Store</h1>
        <div className='mb-4 text-2xl font-bold'>Count: {count}</div>
        <div className='flex gap-2'>
          <Button onClick={increase}>Increase</Button>
          <Button onClick={decrease}>Decrease</Button>
          <Button variant='outline' onClick={reset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
