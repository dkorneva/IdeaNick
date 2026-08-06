import { zCreateIdeaTrpcInput } from '@IdeaNick/backend/src/router/createIdea/input'
import { useFormik } from 'formik'
import { withZodSchema } from 'formik-validator-zod'
import { Input } from '../../components/Input'
import { Segment } from '../../components/Segment'
import { TextArea } from '../../components/Textarea'
import { trpc } from '../../lib/trpc'

export const NewIdeaPage = () => {
  const createIdea = trpc.createIdea.useMutation()
  const formik = useFormik({
    initialValues: {
      name: '',
      nick: '',
      description: '',
      text: '',
    },
    validate: withZodSchema(zCreateIdeaTrpcInput),
    onSubmit: async (values) => {
      await createIdea.mutateAsync(values)
    },
  })

  return (
    <Segment title="New Idea">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          formik.handleSubmit()
        }}
      >
        <Input name="name" label="Name" formik={formik} />
        <Input name="nick" label="Nick" formik={formik} />
        <Input name="description" label="Description" formik={formik} />
        <TextArea name="text" label="Text" formik={formik} />
        {!formik.isValid && !!formik.submitCount && <div style={{ color: 'red' }}>Some fields are invalid</div>}
        {/* !!formik.submitCount - два !!, чтобы явно указать, что это значение boolean */}
        <button type="submit">Create Idea</button>
      </form>
    </Segment>
  )
}
