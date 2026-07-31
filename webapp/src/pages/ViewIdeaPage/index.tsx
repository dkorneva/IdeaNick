import { useParams } from 'react-router-dom'
import type { ViewIdeaRouteParams } from '../../lib/routes'

export const ViewIdeaPage = () => {
  const { ideaNick } = useParams() as ViewIdeaRouteParams
  return (
    <div>
      <h1>{ideaNick}</h1>
      <p>Description of idea 1...</p>

      <div>
        <p>Text paragraph 1 of idea1 ...</p>
        <p>Text paragraph 2 of idea1 ...</p>
        <p>Text paragraph 3 of idea1 ...</p>
      </div>
    </div>
  )
}
