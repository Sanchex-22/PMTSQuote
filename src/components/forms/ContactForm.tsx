import { useEffect, useState } from "react";

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const ContactForm: React.FC = () => {
  const [marinoCookie, setMarinoCookie] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "sending">("idle");

  useEffect(() => {
    setMarinoCookie(getCookie("marino"));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/sendMail", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <form id="contact-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Nombre completo"
        required
        className="rounded border-2 border-slate-300 p-2"
      />
      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        className="rounded border-2 border-slate-300 p-2"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Número de Teléfono"
        className="rounded border-2 border-slate-300 p-2"
      />
      <textarea
        name="message"
        id="message"
        cols={30}
        rows={10}
        placeholder="Mensaje"
        className="rounded border-2 border-slate-300 p-2"
      />
      <input type="text" name="_gotcha" style={{ display: "none" }} />
      <input type="hidden" name="_language" value="es" />
      <input name="subject" type="hidden" value="Contacto de Curso para Marinos" />

      <button
        type="submit"
        disabled={!!marinoCookie || status === "sending"}
        className="transition-colors rounded bg-amber-700 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-amber-500 disabled:opacity-60"
      >
        {status === "sending" ? "Enviando..." : "Enviar"}
      </button>

      {status === "success" && (
        <div className="py-2 px-4 text-center bg-green-700 text-white rounded border border-green-800">
          <p>Mensaje enviado exitosamente</p>
        </div>
      )}
      {status === "error" && (
        <div className="py-2 px-4 bg-orange-600 text-white border rounded border-orange-800 text-center">
          <p>Ocurrió un error al enviar el mensaje</p>
        </div>
      )}
    </form>
  );
};

export default ContactForm;
