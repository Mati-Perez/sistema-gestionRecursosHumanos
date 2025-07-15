"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Evento = {
  id?: number;
  hora: string;
  texto: string;
};

interface EventosPorFecha {
  [fecha: string]: Evento[];
}

export default function CalendarReminder(): React.JSX.Element {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [eventoTexto, setEventoTexto] = useState("");
  const [horaEvento, setHoraEvento] = useState("");
  const [eventosPorFecha, setEventosPorFecha] = useState<EventosPorFecha>({});
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEditado, setTextoEditado] = useState("");
  const [horaEditada, setHoraEditada] = useState("");

  const fechaKey = fechaSeleccionada.toDateString();
  const eventosDelDía = eventosPorFecha[fechaKey] || [];

  // 🔹 Carga eventos desde localStorage + backend si no existen
  useEffect(() => {
    const guardados = localStorage.getItem("eventos");
    const local: EventosPorFecha = guardados ? JSON.parse(guardados) : {};
    setEventosPorFecha(local);

    if (!local[fechaKey]) {
      fetch(`/api/eventos?fecha=${fechaSeleccionada.toISOString()}`)
        .then((res) => res.json())
        .then((data: Evento[]) => {
          const nuevos = { ...local, [fechaKey]: data };
          setEventosPorFecha(nuevos);
          localStorage.setItem("eventos", JSON.stringify(nuevos));
        })
        .catch(() => console.error("Error consultando eventos del backend"));
    }
  }, [fechaKey, fechaSeleccionada]);

  // 🔹 Agrega evento al backend y localStorage
  const agregarEvento = async () => {
    if (!eventoTexto.trim() || !horaEvento.trim()) return;

    try {
      const res = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: fechaSeleccionada.toISOString(),
          hora: horaEvento,
          texto: eventoTexto,
        }),
      });

      const nuevo: Evento = await res.json();
      const actualizados = {
        ...eventosPorFecha,
        [fechaKey]: [...(eventosPorFecha[fechaKey] || []), nuevo],
      };

      setEventosPorFecha(actualizados);
      localStorage.setItem("eventos", JSON.stringify(actualizados));
      setEventoTexto("");
      setHoraEvento("");
    } catch {
      console.error("No se pudo guardar el evento");
    }
  };

  // 🔹 Elimina evento del backend y localStorage
  const eliminarEventoReal = async (eventoId?: number) => {
    if (eventoId === undefined) return;

    try {
      await fetch(`/api/eventos/${eventoId}`, { method: "DELETE" });
      const copia = eventosPorFecha[fechaKey].filter((e) => e.id !== eventoId);
      const actualizados = { ...eventosPorFecha, [fechaKey]: copia };
      setEventosPorFecha(actualizados);
      localStorage.setItem("eventos", JSON.stringify(actualizados));
    } catch {
      console.error("Error eliminando evento");
    }
  };

  // 🔹 Inicia edición de evento
  const comenzarEdicion = (evento: Evento) => {
    if (evento.id === undefined) return;
    setEditandoId(evento.id);
    setTextoEditado(evento.texto);
    setHoraEditada(evento.hora);
  };

  // 🔹 Guarda edición
  const guardarEdicion = async () => {
    if (!textoEditado.trim() || !horaEditada.trim() || editandoId === null) return;

    try {
      const res = await fetch(`/api/eventos/${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: textoEditado, hora: horaEditada }),
      });

      const actualizado: Evento = await res.json();
      const copia = [...eventosPorFecha[fechaKey]];
      const index = copia.findIndex((e) => e.id === editandoId);
      if (index !== -1) {
        copia[index] = actualizado;
        const nuevos = { ...eventosPorFecha, [fechaKey]: copia };
        setEventosPorFecha(nuevos);
        localStorage.setItem("eventos", JSON.stringify(nuevos));
      }
      setEditandoId(null);
    } catch {
      console.error("Error al editar evento");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 shadow-md rounded-lg space-y-6 border dark:border-zinc-700">
      <h2 className="text-2xl font-bold text-center text-blue-700">📅 Calendario Personal</h2>

      <div className="flex justify-center">
        <Calendar
          locale="es-AR"  
          className="rounded-md border border-gray-300 p-2 shadow-sm"
          value={fechaSeleccionada}
          onChange={(value) => {
            if (value instanceof Date) {
              setFechaSeleccionada(value);
            }
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mt-4">Eventos para {fechaKey}</h3>
        <ul className="space-y-2 mt-2">
          {eventosDelDía.length > 0 ? (
            eventosDelDía.map((ev, index) => (
              <li
                key={ev.id ?? `${fechaKey}-${index}`}
                className="bg-gray-100 px-3 py-2 rounded shadow-sm space-y-2"
              >
                {editandoId === ev.id ? (
                  <div className="flex flex-col space-y-2">
                    <input
                      type="text"
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                      className="border px-2 py-1 rounded"
                    />
                    <input
                      type="time"
                      value={horaEditada}
                      onChange={(e) => setHoraEditada(e.target.value)}
                      className="border px-2 py-1 rounded"
                    />
                    <div className="flex space-x-2">
                      <button onClick={guardarEdicion} className="text-green-600 font-semibold">✅</button>
                      <button onClick={() => setEditandoId(null)} className="text-gray-500">❌</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span>{ev.hora} — {ev.texto}</span>
                    <div className="space-x-2">
                      <button onClick={() => comenzarEdicion(ev)} className="text-blue-500 hover:text-blue-700">✏️</button>
                      <button onClick={() => eliminarEventoReal(ev.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay eventos para este día</p>
          )}
        </ul>
      </div>

      <div className="flex flex-col space-y-2 pt-4">
        <input
          type="text"
          value={eventoTexto}
          onChange={(e) => setEventoTexto(e.target.value)}
          placeholder="Nuevo evento"
          className="border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-400"
        />
        <input
          type="time"
          value={horaEvento}
          onChange={(e) => setHoraEvento(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-400"
        />
        <button
          onClick={agregarEvento}
          disabled={!fechaSeleccionada}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          Agendar evento
        </button>
      </div>
    </div>
  );
}
