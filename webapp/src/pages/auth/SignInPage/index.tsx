import { zSignInTrpcInput } from '@IdeaNick/backend/src/router/auth/SignIn/input'
import Cookies from 'js-cookie'
import { Alert } from '../../../components/Alert'
import { Button } from '../../../components/Button'
import { FormItems } from '../../../components/FormItems'
import { Input } from '../../../components/Input'
import { Segment } from '../../../components/Segment'
import { useForm } from '../../../lib/form'
import { withPageWrapper } from '../../../lib/pageWrapper'
import { trpc } from '../../../lib/trpc'
import css from '../auth.module.scss'

export const SignInPage = withPageWrapper({
  redirectAuthorized: true,
  title: 'Sign In',
})(() => {
  const trpcUtils = trpc.useUtils()
  const signIn = trpc.signIn.useMutation()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      nick: '',
      password: '',
    },
    validationSchema: zSignInTrpcInput,
    onSubmit: async (values) => {
      const { token } = await signIn.mutateAsync(values)
      Cookies.set('token', token, { expires: 99999 })
      void trpcUtils.invalidate() // инвалидация помечает все запросы, которые только что были отправлены и которые помнит приложение, как невалидные и перезапрашивает их
    },
    resetOnSuccess: false,
  })
  return (
    <div className={css.authPage}>
      <Segment title="Sign In">
        <form onSubmit={formik.handleSubmit}>
          <FormItems>
            <Input label="Nick" name="nick" formik={formik} />
            <Input label="Password" name="password" formik={formik} type="password" />
            <Alert {...alertProps}></Alert>
            <Button {...buttonProps}>Sign In</Button>
          </FormItems>
        </form>
      </Segment>
    </div>
  )
})
