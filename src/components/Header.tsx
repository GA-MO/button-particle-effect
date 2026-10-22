import { Button } from '@mantine/core'
import { NavLink } from 'react-router'

export default function Header() {
  return (
    <div className='mt-6 text-center'>
      <div className='flex justify-center gap-4'>
        <NavLink to='/'>
          {({ isActive }) => <Button variant={isActive ? 'filled' : 'light'}>Home</Button>}
        </NavLink>
        <NavLink to='/form'>
          {({ isActive }) => <Button variant={isActive ? 'filled' : 'light'}>Form</Button>}
        </NavLink>
        <NavLink to='/query'>
          {({ isActive }) => <Button variant={isActive ? 'filled' : 'light'}>Query</Button>}
        </NavLink>
        <NavLink to='/store'>
          {({ isActive }) => <Button variant={isActive ? 'filled' : 'light'}>Store</Button>}
        </NavLink>
      </div>
    </div>
  )
}
