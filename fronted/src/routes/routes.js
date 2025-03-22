import React, { Children } from "react";
import { Layout } from "../shared/components/Layout";
import { LayoutDashboard } from "../shared/components/LayoutDashboard";

const HomePage = React.lazy(() => import("../features/home/HomePage"));
const StudentLoginPage = React.lazy(() => import("../features/auth/StudentLoginPaeg"));
const NotificationPage = React.lazy(()=> import("../features/notifications/NotificationPage"));

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
          path:"notificaciones",
          element: <NotificationPage/>
        }
      ]
    }
  ]