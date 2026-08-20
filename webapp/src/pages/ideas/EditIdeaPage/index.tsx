import { zUpdateIdeaTrpcInput } from '@IdeaNick/backend/src/router/ideas/updateIdea/input'
import { canEditIdea } from '@IdeaNick/backend/src/utils/can'
import { pick } from '@IdeaNick/shared/src/pick'
import { useNavigate } from 'react-router-dom'
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
import { getEditIdeaRoute, getViewIdeaRoute } from '../../../lib/routes'
import { trpc } from '../../../lib/trpc'

// idea - это то, что возвращается по TrcRouterOutput по endpoint getIdea в объекте idea
export const EditIdeaPage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { ideaNick } = getEditIdeaRoute.useParams()
    return trpc.getIdea.useQuery({
      ideaNick,
    })
  },
  setProps: ({ queryResult, ctx, checkExists, checkAccess }) => {
    const idea = checkExists(queryResult.data.idea, 'Idea not found')
    checkAccess(canEditIdea(ctx.me, idea), 'An idea can only be edited by the author')
    return {
      idea,
    }
  },
  title: ({ idea }) => `Edit Idea: "${idea.name}"`,
})(({ idea }) => {
  const navigate = useNavigate()
  const updateIdea = trpc.updateIdea.useMutation()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: pick(idea, ['name', 'nick', 'description', 'text', 'images', 'certificate', 'documents']),
    // omit - в валидации формы не нужен ideaId (обратно extend)
    validationSchema: zUpdateIdeaTrpcInput.omit({ ideaId: true }),
    onSubmit: async (values) => {
      await updateIdea.mutateAsync({ ideaId: idea.id, ...values })
      navigate(getViewIdeaRoute({ ideaNick: values.nick }))
    },
    resetOnSuccess: false,
    showValidationAlert: true,
  })

  return (
    <Segment title={`Edit Idea: ${idea.nick}`}>
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input label="Name" name="name" formik={formik} />
          <Input label="Nick" name="nick" formik={formik} />
          <Input label="Description" name="description" formik={formik} maxWidth={500} />
          <TextArea label="Text" name="text" formik={formik} />
          <UploadsToCloudinary label="Images" name="images" type="image" preset="preview" formik={formik} />
          <UploadToS3 label="Certificate" name="certificate" formik={formik} />
          <UploadsToS3 label="Documents" name="documents" formik={formik} />
          <Alert {...alertProps}></Alert>
          <br />
          <br />
          <Button {...buttonProps}>Update Idea</Button>
        </FormItems>
      </form>
    </Segment>
  )
})
