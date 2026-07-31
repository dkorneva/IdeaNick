import { Link, Outlet } from 'react-router-dom'
import { getAllIdeasRoute } from '../../lib/routes'

export const Layout = () => {
  return (
    <div>
      <p>
        <b>IdeaNick</b>
      </p>
      <ul>
        <li>
          <Link to={getAllIdeasRoute()}>All Ideas</Link>
        </li>
      </ul>
      <hr />
      <div>
        {/* Outlet (react-router) прокинет сюда ту страницу, которая окажется обёрнута данным Layout */}
        <Outlet />
      </div>
    </div>
  )
}
