import { zCreateIdeaTrpcInput } from '@IdeaNick/backend/src/router/ideas/createIdea/input'
import { Alert } from '../../../components/Alert'
import { Button } from '../../../components/Button'
import { FormItems } from '../../../components/FormItems'
import { Input } from '../../../components/Input'
import { Segment } from '../../../components/Segment'
import { TextArea } from '../../../components/Textarea'
import { UploadToS3 } from '../../../components/UploadToS3'
import { UploadsToCloudinary } from '../../../components/UploadsToCloudinary'
import { UploadsToS3 } from '../../../components/UploadsToS3'
import { useForm } from '../../../lib/form'
import { withPageWrapper } from '../../../lib/pageWrapper'
import { trpc } from '../../../lib/trpc'

export const NewIdeaPage = withPageWrapper({
  authorizedOnly: true,
  title: 'New Idea',
})(() => {
  const createIdea = trpc.createIdea.useMutation()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      name: '',
      nick: '',
      description: '',
      text: '',
      images: [],
      certificate: '',
      documents: [],
    },
    validationSchema: zCreateIdeaTrpcInput,
    onSubmit: async (values) => {
      await createIdea.mutateAsync(values)
      // форма считается успешно отправленно после того, как данный промис отработает без ошибок
      // если у него будет вызвана ошибка, то код ниже не пройдёт, иначе - пройдёт
      formik.resetForm()
    },
    successMessage: 'Idea created!',
    showValidationAlert: true,
  })

  return (
    <Segment title="New Idea">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          formik.handleSubmit()
        }}
      >
        <FormItems>
          <Input name="name" label="Name" maxWidth={320} formik={formik} />
          <Input name="nick" label="Nick" maxWidth={320} formik={formik} />
          <Input name="description" label="Description" formik={formik} maxWidth={500} />
          <TextArea name="text" label="Text" formik={formik} />
          <UploadsToCloudinary label="Images" name="images" type="image" preset="preview" formik={formik} />
          <UploadToS3 label="Certificate" name="certificate" formik={formik} />
          <UploadsToS3 label="Documents" name="documents" formik={formik} />
          <Alert {...alertProps}></Alert>
          <br />
          <br />
          <Button {...buttonProps}>Create Idea</Button>
        </FormItems>
      </form>
    </Segment>
  )
})
