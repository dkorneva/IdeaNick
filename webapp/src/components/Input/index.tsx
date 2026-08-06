/* eslint-disable @typescript-eslint/no-explicit-any */

import type { FormikProps } from 'formik'

export const Input = ({ name, label, formik }: { name: string; label: string; formik: FormikProps<any> }) => {
  const value = formik.values[name]
  const error = formik.errors[name] as string | undefined // необходимо чётко указать тип ошибки, т.к. без этого, считается, что error может содержать всё, что угодно
  // это связано с тем, что форма может быть вложенная, т.е. в ней необязательно содержится плоский объект
  const touched = formik.touched[name]
  return (
    <div style={{ marginBottom: 10 }}>
      <label htmlFor={name}>{label}</label>
      <br />
      <input
        type="text"
        onChange={(e) => {
          void formik.setFieldValue(name, e.target.value)
        }}
        onBlur={() => {
          void formik.setFieldTouched(name) // onBlur возникает, когда пользователь снимает фокус с компонента
        }}
        value={value}
        name={name}
        id={name}
      />
      {!!touched && !!error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  )
}
