import { useDemoList } from '../../datas/demo/hooks'
import { Button } from '@mantine/core'

export default function Query() {
  const demoList = useDemoList({ limit: 10 })

  return (
    <div>
      <div className='mt-20 flex flex-col items-center justify-center'>
        <h1 className='mb-4 text-3xl font-bold'>Query</h1>
        {demoList.isLoading ? (
          <div>Loading...</div>
        ) : (
          <div>{demoList.data?.map((item) => <div key={item.id}>{item.name}</div>)}</div>
        )}
        <br />
        <Button onClick={() => demoList.refetch()} loading={demoList.isFetching}>
          Refetch
        </Button>
      </div>
    </div>
  )
}
