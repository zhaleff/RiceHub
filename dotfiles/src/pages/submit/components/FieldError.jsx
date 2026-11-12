export default function FieldError({ message }) {
  return message ? <p className="text-xs text-red-300 mt-1.5">{message}</p> : null
}
