"use client";

import 'react-calendar/dist/Calendar.css';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface EventosPorFecha {
  [fecha: string]: string[];
}

export default function CalendarReminder(): React.JSX.Element {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(new Date());
  const [evento, setEvento] = useState<string>('');
  const [eventos, setEventos] = useState<EventosPorFecha>({});

  useEffect(() => {
    const datosGuardados = localStorage.getItem('eventos');
    if (datosGuardados) {
      setEventos(JSON.parse(datosGuardados));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('eventos', JSON.stringify(eventos));
  }, [eventos]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>): void => {
    setEvento(e.target.value);
  };

  const agregarEvento = (): void => {
    if (!evento.trim() || !fechaSeleccionada) return;

    const fechaKey = fechaSeleccionada.toDateString();
    const nuevos = {
      ...eventos,
      [fechaKey]: [...(eventos[fechaKey] || []), evento],
    };

    setEventos(nuevos);
    setEvento('');
  };

  const eliminarEvento = (fechaKey: string, index: number): void => {
    const copia = [...eventos[fechaKey]];
    copia.splice(index, 1);
    const actualizado = { ...eventos, [fechaKey]: copia };
    setEventos(actualizado);
  };

  const fechaKey = fechaSeleccionada?.toDateString();
  const eventosDelDía = fechaKey ? eventos[fechaKey] || [] : [];

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg space-y-6 dark:bg-zinc-900 border-b dark:border-zinc-700">
    <h2 className="text-2xl font-bold text-center text-blue-700">📅 Calendario Personal</h2>

    <div className="flex justify-center">
      <Calendar
        className="rounded-md border border-gray-300 p-2 shadow-sm"
        value={fechaSeleccionada}
        onChange={(value) => {
          if (value instanceof Date) {
            setFechaSeleccionada(value);
          }
        }}
      />
    </div>


    {fechaSeleccionada && (
      <>
        <h3 className="text-lg font-semibold text-gray-800">
          Eventos para {fechaKey}
        </h3>
        <ul className="space-y-1">
          {eventosDelDía.length > 0 ? (
            eventosDelDía.map((ev, i) => (
              <li key={i} className="flex justify-between items-center bg-gray-100 rounded px-3 py-1">
                <span>{ev}</span>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => eliminarEvento(fechaKey!, i)}
                >
                  ❌
                </button>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">No hay eventos para este día</p>
          )}
        </ul>
      </>
    )}

    <div className="flex flex-col space-y-2">
      <input
        type="text"
        value={evento}
        onChange={manejarCambio}
        placeholder="Escribí un nuevo evento..."
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={agregarEvento}
        disabled={!fechaSeleccionada}
        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        Agregar evento
      </button>
    </div>
  </div>

  );
}
