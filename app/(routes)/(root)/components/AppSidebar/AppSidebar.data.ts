import { Calendar, Contact, FileText, ClipboardList, Settings, FileTextIcon } from "lucide-react";

export const routes = [
  {
    title: "Directorio",
    url: "/",
    icon: Contact,
  },
  {
    title: "Calendario",
    url: "/calendario",
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
  }
];

