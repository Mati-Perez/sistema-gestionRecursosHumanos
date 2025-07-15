import { Calendar, Contact, FileText, ClipboardList, Settings, FileTextIcon, User2, LogOutIcon } from "lucide-react";

export const routes = [
  {
    title: "Clientes",
    url: "/",
    icon: Contact,
  },
  {
    title: "Usuarios",
    url: "/usuarios",
    icon: User2,
  },
  {
    title: "Calendario personal",
    url: "/calendario",
    icon: Calendar,
  },
  {
    title: "Calendario de aportes",
    url: "/aportes",
    icon: Calendar,
  },
  {
    title: "Documentos",
    url: "/documentos",
    icon: FileText,
  },
  {
    title: "Nomina",
    url: "/nomina",
    icon: ClipboardList,
  },
  {
    title: "Facturas",
    url: "/facturas",
    icon: FileTextIcon,
  },
  {
    title: "Ajustes",
    url: "/ajustes",
    icon: Settings,
  },
  {
    title: "Salir",
    url: "/logout",
    icon: LogOutIcon,
    action: true,
  }
];

