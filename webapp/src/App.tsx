import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NotAuthRouteTracker } from './components/NotAuthRouteTracker'
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
    <HelmetProvider>
      <TrpcProvider>
        <AppContextProvider>
          <BrowserRouter>
            <NotAuthRouteTracker />
            <Routes>
              <Route path={routes.getSignOutRoute.definition} element={<SignOutPage />}></Route>
              <Route element={<Layout />}>
                <Route path={routes.getSignInRoute.definition} element={<SignInPage />}></Route>
                <Route path={routes.getSignUpRoute.definition} element={<SignUpPage />}></Route>
                <Route path={routes.getAllIdeasRoute.definition} element={<AllIdeasPage />}></Route>
                <Route path={routes.getNewIdeaRoute.definition} element={<NewIdeaPage />}></Route>
                <Route path={routes.getViewIdeaRoute.definition} element={<ViewIdeaPage />}></Route>
                <Route path={routes.getEditIdeaRoute.definition} element={<EditIdeaPage />}></Route>
                <Route path="*" element={<NotFoundPage />}></Route>
                <Route path={routes.getEditProfileRoute.definition} element={<EditProfilePage />}></Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AppContextProvider>
      </TrpcProvider>
    </HelmetProvider>
  )
}
