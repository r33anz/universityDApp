import React, { Children } from "react";
import { Layout } from "../shared/components/Layout";
import { LayoutDashboard } from "../shared/components/LayoutDashboard";

const HomePage = React.lazy(() => import("../features/home/HomePage"));
const HomePageAdmin = React.lazy(() => import("../features/home/HomePageAdministration"));
const StudentLoginPage = React.lazy(() => import("../features/auth/StudentLoginPaeg"));
const NotificationPage = React.lazy(()=> import("../features/notifications/NotificationPage"));
const FileConverterPage = React.lazy(()=> import("../features/file-converter/FileConverterPage"));

export const routes = [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "estudiante",
          element: <StudentLoginPage />,
        }
      ],
    },
    {
      path:"/administracion",
      element: <LayoutDashboard/>,
      children:[
        {
          index: true,
          element: <HomePageAdmin />,
        },
        {
          path:"notificaciones",
          element: <NotificationPage/>
        },
        {
          path:"manejo_archivo",
          element: <FileConverterPage/>
        }
      ]
    }
  ]