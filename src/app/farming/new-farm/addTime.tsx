'use client'
import DatePicker from 'react-datepicker'

type AddTimeProps = {
  time: { startAt: number; endAt: number }
  onTime: (val: { startAt: number; endAt: number }) => void
}
export default function AddTime({ time, onTime }: AddTimeProps) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-6 flex flex-col gap-2">
        <p className="text-sm">Start time</p>
        <DatePicker
          showIcon
          selected={new Date(time.startAt)}
          onChange={(date) =>
            onTime({ ...time, startAt: date?.getTime() || 0 })
          }
          className="bg-base-200 !px-3 !py-2 rounded-xl w-full"
          dateFormat={'dd/MM/yyyy, HH:mm'}
          showTimeInput
          showTimeSelect
          placeholderText="Select time"
        />
      </div>
      <div className="col-span-6 flex flex-col gap-2">
        <p className="text-sm">End time</p>
        <DatePicker
          showIcon
          selected={time.endAt ? new Date(time.endAt) : null}
          onChange={(date) => onTime({ ...time, endAt: date?.getTime() || 0 })}
          className="bg-base-200 !px-3 !py-2 rounded-xl w-full"
          dateFormat={'dd/MM/yyyy, HH:mm'}
          showTimeInput
          showTimeSelect
          placeholderText="Select time"
        />
      </div>
    </div>
  )
}
