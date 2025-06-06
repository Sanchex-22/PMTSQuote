export function QuotesSection() {
  const quotes = [
    {
      id: "COT-2023-001",
      date: "15/04/2023",
      description: "Seguro de Vida Familiar",
      amount: "$1,250.00",
      status: "Pendiente",
    },
    {
      id: "COT-2023-002",
      date: "22/05/2023",
      description: "Seguro de Auto Completo",
      amount: "$780.50",
      status: "Aprobada",
    },
    {
      id: "COT-2023-003",
      date: "10/06/2023",
      description: "Seguro de Hogar",
      amount: "$950.75",
      status: "En revisión",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Mis Cotizaciones
      </h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {quotes.map((quote) => (
            <li key={quote.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <p className="text-sm font-medium text-orange-600 truncate">
                      {quote.id}
                    </p>
                    <p className="text-sm text-gray-500">{quote.date}</p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            quote.status === "Aprobada"
                              ? "bg-green-100 text-green-800"
                              : quote.status === "Pendiente"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                    >
                      {quote.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-700">
                      {quote.description}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-700 sm:mt-0">
                    <p className="font-medium">{quote.amount}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <button className="text-sm text-orange-600 hover:text-orange-800">
                    Ver detalles
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
