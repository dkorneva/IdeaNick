import { createRef } from 'react'
import { Link, Outlet } from 'react-router-dom'
import Logo from '../../assets/images/logo.svg?react'
import { useMe } from '../../lib/ctx'
import {
  getAllIdeasRoute,
  getNewIdeaRoute,
  getSignInRoute,
  getSignUpRoute,
  getSignOutRoute,
  getEditProfileRoute,
} from '../../lib/routes'
import { Icon } from '../Icon'
import css from './index.module.scss'

export const layoutContentElRef = createRef<HTMLDivElement>()

export const Layout = () => {
  const me = useMe()
  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <Logo className={css.logo} />
        <ul className={css.menu}>
          <li className={css.item}>
            <Link className={css.link} to={getAllIdeasRoute()}>
              <Icon className={css.icon} name="home" />
              <span>All Ideas</span>
            </Link>
          </li>
          {me ? (
            <>
              <li className={css.item}>
                <Link className={css.link} to={getNewIdeaRoute()}>
                  <Icon className={css.icon} name="addIdea" />
                  <span>Add Idea</span>
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getEditProfileRoute()}>
                  <Icon className={css.icon} name="editProfile" />
                  <span>Edit Profile</span>
                </Link>
              </li>
              <hr />
              <li className={css.item}>
                <Link className={css.link} to={getSignOutRoute()}>
                  <Icon className={css.icon} name="logout" />
                  <span>Log Out ({me.nick})</span>
                </Link>
              </li>
            </>
          ) : (
            <>
              <hr />
              <li className={css.item}>
                <Link className={css.link} to={getSignInRoute()}>
                  Sign In
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getSignUpRoute()}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className={css.content} ref={layoutContentElRef}>
        <Outlet />
      </div>
    </div>
  )
}
