"use client";

import { useEffect, useState, useTransition } from "react";

type Warehouse = {
  id: string;
  name: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    fetch("/api/warehouses")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load warehouses");
        return (await response.json()) as Warehouse[];
      })
      .then((data) => {
        if (!cancelled) setWarehouses(data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Failed to load warehouses");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

      return () => {
        cancelled = true;
      };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      setError("");

      try {
        const response = await fetch("/api/warehouses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, address }),
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to create warehouse");
          return;
        }

        setWarehouses((current) =>
          [...current, data as Warehouse].sort((a,b) => 
            a.name.localeCompare(b.name),
          ),
        );
        setName("");
        setAddress("");
      } catch {
        setError("Could not reach the server. Try again.");
      }
    });
  }

  return (
    <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Warehouses
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
          Name
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            required
            className="rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">
          Address
          <input 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={500}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          />
        </label>

        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="self-end rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add warehouse"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <ul className="mt-5 divide-y divide-gray-200 dark:divide-gray-700">
        {loading ? (
          <li className="py-3 text-sm text-gray-500">Loading warehouses...</li>
        ) : warehouses.length === 0 ? (
          <li className="py-3 text-sm text-gray-500">No warehouses yet.</li>
        ) : (
          warehouses.map((warehouse) => (
            <li key={warehouse.id} className="py-3">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {warehouse.name}
              </p>
              {warehouse.address && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {warehouse.address}
                </p>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}