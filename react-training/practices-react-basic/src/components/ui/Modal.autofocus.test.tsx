import { useLayoutEffect, useRef } from 'react'
import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'
import { installDialogStub } from '@/test/dialogStub'
import { Modal } from './Modal'

function FocusThiefButton(): JSX.Element {
  const ref = useRef<HTMLButtonElement>(null)
  useLayoutEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <button ref={ref} type="button">
      Other control
    </button>
  )
}

beforeAll(() => {
  installDialogStub()
})

describe('Modal data-autofocus', () => {
  it('focuses the data-autofocus field even when focus already sits in the panel', () => {
    render(
      <Modal isOpen onClose={() => undefined} title="Log In">
        <FocusThiefButton />
        <input aria-label="Email" data-autofocus />
      </Modal>
    )
    expect(screen.getByLabelText('Email')).toHaveFocus()
  })

  it('without a data-autofocus element keeps the first-control rule', () => {
    render(
      <Modal isOpen onClose={() => undefined} title="Log In">
        <input aria-label="Email" />
      </Modal>
    )
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus()
  })
})
