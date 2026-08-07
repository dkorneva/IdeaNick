/* eslint-disable @typescript-eslint/no-explicit-any */

// cn позволяет добавлять опциональные классы
import cn from 'classnames'
import type { FormikProps } from 'formik'
import css from './index.module.scss'

export const Input = ({
  name,
  label,
  formik,
  maxWidth,
  type = 'text',
}: {
  name: string
  label: string
  formik: FormikProps<any>
  maxWidth?: number
  type?: 'text' | 'password'
}) => {
  const value = formik.values[name]
  const error = formik.errors[name] as string | undefined // необходимо чётко указать тип ошибки, т.к. без этого, считается, что error может содержать всё, что угодно
  // это связано с тем, что форма может быть вложенная, т.е. в ней необязательно содержится плоский объект
  const touched = formik.touched[name]
  const disabled = formik.isSubmitting
  const invalid = !!touched && !!error
  return (
    <div className={cn({ [css.field]: true, [css.disabled]: disabled })}>
      <label className={css.label} htmlFor={name}>
        {label}
      </label>
      <input
        className={cn({ [css.input]: true, [css.invalid]: invalid })}
        style={{ maxWidth }}
        type={type}
        onChange={(e) => {
          void formik.setFieldValue(name, e.target.value)
        }}
        onBlur={() => {
          void formik.setFieldTouched(name) // onBlur возникает, когда пользователь снимает фокус с компонента
        }}
        value={value}
        name={name}
        id={name}
        disabled={formik.isSubmitting}
      />
      {invalid && <div className={css.error}>{error}</div>}
    </div>
  )
}
