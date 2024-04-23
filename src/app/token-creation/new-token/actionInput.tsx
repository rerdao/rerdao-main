export type ActionInputProps = { onClick?: () => void } & Omit<
  JSX.IntrinsicElements['input'],
  'onClick' | 'className'
>

export function SmActionInput({
  onClick = () => {},
  children,
  ...props
}: ActionInputProps) {
  return (
    <div className="relative flex flex-row items-center">
      <input className="input input-sm w-full pr-8 bg-base-200" {...props} />
      <button
        className="btn btn-xs btn-square absolute right-1"
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  )
}

export function MdActionInput({
  onClick = () => {},
  children,
  ...props
}: ActionInputProps) {
  return (
    <div className="relative flex flex-row items-center">
      <input className="input w-full pr-12 bg-base-200" {...props} />
      <button
        className="btn btn-sm btn-square absolute right-2"
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  )
}
