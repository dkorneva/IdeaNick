import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppContextProvider } from './lib/ctx'
import * as routes from './lib/routes'
import { TrpcProvider } from './lib/trpc'
import { EditProfilePage } from './pages/auth/EditProfilePage'
import { SignInPage } from './pages/auth/SignInPage'
import { SignOutPage } from './pages/auth/SignOutPage'
import { SignUpPage } from './pages/auth/SignUpPage'
import { AllIdeasPage } from './pages/ideas/AllIdeasPage'
import { EditIdeaPage } from './pages/ideas/EditIdeaPage'
import { NewIdeaPage } from './pages/ideas/NewIdeaPage'
import { ViewIdeaPage } from './pages/ideas/ViewIdeaPage'
import { NotFoundPage } from './pages/other/NotFoundPage'
import './styles/global.scss'

export const App = () => {
  // все страницы будут передаваться внутрь TrpcProvider
  // благодаря этому внутри этих страниц будут доступны trpc-функции
  return (
    <TrpcProvider>
      <AppContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path={routes.getSignOutRoute()} element={<SignOutPage />}></Route>
            <Route element={<Layout />}>
              <Route path={routes.getSignInRoute()} element={<SignInPage />}></Route>
              <Route path={routes.getSignUpRoute()} element={<SignUpPage />}></Route>
              <Route path={routes.getAllIdeasRoute()} element={<AllIdeasPage />}></Route>
              <Route path={routes.getNewIdeaRoute()} element={<NewIdeaPage />}></Route>
              <Route path={routes.getViewIdeaRoute(routes.viewIdeaRouteParams)} element={<ViewIdeaPage />}></Route>
              <Route path={routes.getEditIdeaRoute(routes.editIdeaRouteParams)} element={<EditIdeaPage />}></Route>
              <Route path="*" element={<NotFoundPage />}></Route>
              <Route path={routes.getEditProfileRoute()} element={<EditProfilePage />}></Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AppContextProvider>
    </TrpcProvider>
  )
}
