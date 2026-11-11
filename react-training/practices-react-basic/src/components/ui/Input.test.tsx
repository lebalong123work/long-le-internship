import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './Input'

interface EmailForm {
  email: string
}

const REQUIRED_MESSAGE = 'Email is required'

function EmailFormHarness({ onValid }: { onValid: (values: EmailForm) => void }): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>()

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <Input
        label="Email"
        error={errors.email?.message}
        {...register('email', { required: REQUIRED_MESSAGE })}
      />
      <button type="submit">Submit</button>
    </form>
  )
}

describe('Input label', () => {
  it('finds the input by its label', () => {
    render(<Input label="Email" />)

    expect(screen.getByLabelText('Email').tagName).toBe('INPUT')
  })

  it('gives two inputs different generated ids', () => {
    render(
      <>
        <Input label="Email" />
        <Input label="Password" />
      </>
    )

    expect(screen.getByLabelText('Email').id).not.toBe(screen.getByLabelText('Password').id)
  })
})

describe('Input error', () => {
  it('shows the error under the field and links it with aria-describedby', () => {
    render(<Input label="Email" error="Invalid email" />)

    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Invalid email')
  })

  it('shows no error and aria-invalid false without an error', () => {
    render(<Input label="Email" />)

    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'false')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('uses the error border when an error is given', () => {
    render(<Input label="Email" error="Invalid email" />)

    expect(screen.getByLabelText('Email')).toHaveClass('border-error')
    expect(screen.getByText('Invalid email')).toHaveClass('text-error')
  })

  it('uses the medium border without an error', () => {
    render(<Input label="Email" />)

    const input = screen.getByLabelText('Email')
    expect(input).toHaveClass('border-medium')
    expect(input).not.toHaveClass('border-error')
  })
})

describe('Input with react-hook-form', () => {
  it('sends the typed value through register to handleSubmit', async () => {
    const onValid = vi.fn()
    render(<EmailFormHarness onValid={onValid} />)

    await userEvent.type(screen.getByLabelText('Email'), 'user@store.com')
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onValid).toHaveBeenCalledWith({ email: 'user@store.com' }, expect.anything())
  })

  it('shows the required-rule message from register as the error', async () => {
    const onValid = vi.fn()
    render(<EmailFormHarness onValid={onValid} />)

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText(REQUIRED_MESSAGE)).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(REQUIRED_MESSAGE)
    expect(onValid).not.toHaveBeenCalled()
  })
})

describe('Input native props', () => {
  it('passes type, placeholder and autoComplete to the input', () => {
    render(<Input label="Email" type="email" placeholder="you@store.com" autoComplete="email" />)

    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'you@store.com')
    expect(input).toHaveAttribute('autocomplete', 'email')
  })

  it('cannot be typed into when disabled', async () => {
    render(<Input label="Email" disabled />)

    const input = screen.getByLabelText('Email')
    await userEvent.type(input, 'abc')

    expect(input).toBeDisabled()
    expect(input).toHaveValue('')
  })
})

describe('Input placeholder', () => {
  it('uses the medium-dark placeholder color', () => {
    render(<Input label="Email" placeholder="you@store.com" />)

    expect(screen.getByLabelText('Email')).toHaveClass('placeholder:text-medium-dark')
  })

  it('does not use the light-medium placeholder color', () => {
    render(<Input label="Email" placeholder="you@store.com" />)

    expect(screen.getByLabelText('Email')).not.toHaveClass('placeholder:text-light-medium')
  })
})
