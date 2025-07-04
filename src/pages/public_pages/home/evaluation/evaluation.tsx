"use client";

import type React from "react";
import { useState } from "react";

// Asegúrate de que las rutas a tus servicios y acciones sean correctas
import { evaluationAction } from "../../../../actions/evaluation";

// Define un tipo para el estado de la alerta, para mejor tipado con TypeScript
interface AlertState {
  message: string;
  type: "success" | "error"; // Puedes añadir 'info', 'warning', etc. si necesitas más tipos
}

const ratingOptions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "very-poor", label: "Very Poor" },
];

export default function Evaluation() {

  const [alert, setAlert] = useState<AlertState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setAlert(null);
    setIsSubmitting(true);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const data: { [key: string]: string | File } = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    console.log("Form submitted:", data);

    try {
      await evaluationAction(formData);
      setAlert({ message: "Evaluation submitted successfully!", type: "success" });
      form.reset();
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      setAlert({
        message: "There was an error submitting your evaluation. Please try again later.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setAlert(null);
      }, 5000);
    }
  };

  const RatingQuestion = ({
    question,
    field,
    required = true,
  }: {
    question: string;
    field: string;
    required?: boolean;
  }) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 leading-relaxed">
        {question} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-6">
        {ratingOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="radio"
              name={field}
              value={option.value}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
              required={required}
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {alert && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg border-l-4 ${
            alert.type === "success"
              ? "bg-green-100 border-green-500 text-green-800"
              : "bg-red-100 border-red-500 text-red-800"
          } z-50 transition-opacity duration-300 ease-in-out opacity-100`}
          role="alert"
        >
          <div className="flex items-center">
            {alert.type === "success" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {alert.type === "error" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <span className="font-medium text-sm">{alert.message}</span>
            {/* Botón para cerrar la alerta manualmente */}
            <button
              onClick={() => setAlert(null)}
              className="ml-auto text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
              aria-label="Cerrar alerta"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Classroom and Instructor Evaluation (R-DE2-01)
          </h1>
          <p className="text-gray-600">
            Please complete this evaluation form to help us improve our training
            services. Fields marked with * are required.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course and Instructor Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Course and Instructor
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="courseName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                placeholder="Enter course name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="instructorName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Instructor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="instructorName"
                name="instructorName"
                placeholder="Enter instructor name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Administrative Process */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              1. Administrative Process
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <RatingQuestion
              question="The attention of our personnel was..."
              field="personnelAttention"
            />
            <hr className="border-gray-200" />
            <RatingQuestion
              question="Your questions or concerns about our services were replied..."
              field="questionsReplied"
            />
            <hr className="border-gray-200" />
            <RatingQuestion
              question="The delivery time for your certificates were..."
              field="certificateDelivery"
            />
            <hr className="border-gray-200" />
            <RatingQuestion
              question="Our website offer information of your interest..."
              field="websiteInformation"
            />
          </div>
        </div>

        {/* Training and Assessment Courses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              2. Training and Assessment Courses
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <RatingQuestion
              question="Our facilities (classroom, simulator room, installation for practice exercises) for courses were..."
              field="facilities"
            />
            <hr className="border-gray-200" />
            <RatingQuestion
              question="The schedule was appropriate with the material"
              field="scheduleAppropriate"
            />
            <hr className="border-gray-200" />
            <RatingQuestion
              question="The study material was complete and update"
              field="studyMaterial"
            />
            <hr className="border-gray-200" />
            <RatingQuestion
              question="The quality of the training and assessment services was..."
              field="trainingQuality"
            />
          </div>
        </div>

        {/* Instructor/Assessor Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              3. Instructor / Assessor Performance
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <RatingQuestion
              question="Provide feedback and re-teach when necessary"
              field="provideFeedback"
            />
            <hr className="border-gray-200" />
            <RatingQuestion
              question="Demonstrate and provide examples"
              field="demonstrateExamples"
            />
            <hr className="border-gray-200" />
            <RatingQuestion
              question="Encourage participation from all students"
              field="encourageParticipation"
            />
            <hr className="border-gray-200" />
            <RatingQuestion
              question="Communicate in a clear way"
              field="communicateClearly"
            />
            <hr className="border-gray-200" />
            <RatingQuestion
              question="Demonstrate knowledge of the program and manual courses"
              field="demonstrateKnowledge"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Evaluation"}{" "}
            {/* Cambia el texto del botón */}
          </button>
        </div>
      </form>
    </div>
  );
}