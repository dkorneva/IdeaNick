import css from './index.module.scss'

export const FormItems = ({ children }: { children: React.ReactNode }) => {
  return <div className={css.formItem}>{children}</div>
}
