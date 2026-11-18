import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

const OPTIONS = ['Hanoi', 'Da Nang']

interface CityForm {
  city: string
}

function CityFormHarness({ onValid }: { onValid: (values: CityForm) => void }): JSX.Element {
  const { register, handleSubmit } = useForm<CityForm>({ defaultValues: { city: '' } })

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <Select label="City" placeholder="Select a city" options={OPTIONS} {...register('city')} />
      <button type="submit">Submit</button>
    </form>
  )
}

describe('Select', () => {
  it('finds the select by its label', () => {
    render(<Select label="City" placeholder="Select a city" options={OPTIONS} />)
    expect(screen.getByLabelText('City').tagName).toBe('SELECT')
  })

  it('lists a disabled placeholder first, then the options', () => {
    render(<Select label="City" placeholder="Select a city" options={OPTIONS} />)
    const options = screen.getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual([
      'Select a city',
      'Hanoi',
      'Da Nang',
    ])
    expect(options[0]).toBeDisabled()
    expect(options[0]).toHaveValue('')
  })

  it('marks the select invalid and links the error text', () => {
    render(<Select label="City" placeholder="Select a city" options={OPTIONS} error="Pick one" />)
    const select = screen.getByLabelText('City')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAccessibleDescription('Pick one')
  })

  it('works with register and submits the chosen option', async () => {
    const onValid = vi.fn()
    render(<CityFormHarness onValid={onValid} />)
    await userEvent.selectOptions(screen.getByLabelText('City'), 'Da Nang')
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(onValid).toHaveBeenCalledWith({ city: 'Da Nang' }, expect.anything())
  })

  it('can be disabled', () => {
    render(<Select label="City" placeholder="Select a city" options={OPTIONS} disabled />)
    expect(screen.getByLabelText('City')).toBeDisabled()
  })
})
