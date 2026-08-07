import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import * as routes from './lib/routes'
import { TrpcProvider } from './lib/trpc'
import { AllIdeasPage } from './pages/AllIdeasPage'
import { NewIdeaPage } from './pages/NewIdeaPage'
import { SignInPage } from './pages/SignInPage'
import { SignOutPage } from './pages/SignOutPage'
import { SignUpPage } from './pages/SignUpPage'
import { ViewIdeaPage } from './pages/ViewIdeaPage'
import './styles/global.scss'

export const App = () => {
  // все страницы будут передаваться внутрь TrpcProvider
  // благодаря этому внутри этих страниц будут доступны trpc-функции
  return (
    <TrpcProvider>
      <BrowserRouter>
        <Routes>
          <Route path={routes.getSignOutRoute()} element={<SignOutPage />}></Route>
          <Route element={<Layout />}>
            <Route path={routes.getSignInRoute()} element={<SignInPage />}></Route>
            <Route path={routes.getSignUpRoute()} element={<SignUpPage />}></Route>
            <Route path={routes.getAllIdeasRoute()} element={<AllIdeasPage />}></Route>
            <Route path={routes.getNewIdeaRoute()} element={<NewIdeaPage />}></Route>
            <Route path={routes.getViewIdeaRoute(routes.viewIdeaRouteParams)} element={<ViewIdeaPage />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </TrpcProvider>
  )
}
