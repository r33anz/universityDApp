import React,{ Suspense } from "react" 
import { BrowserRouter, useRoutes } from "react-router-dom"
import { routes } from "./routes"

const Router = () => {
    const element = useRoutes(routes)
    return element
  }
  
  export const AppRouter = () => {
    return (
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Router />
        </Suspense>
      </BrowserRouter>
    )
  }
  
  