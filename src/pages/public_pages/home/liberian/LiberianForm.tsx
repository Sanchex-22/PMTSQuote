"use client"; // ¡Muy importante! Define este componente como un Client Component.

import type React from "react";
import { useState, useEffect, useCallback, type FC } from "react";
import { submitApplication } from "../../../../actions/liberianActions";
import stcwCountries from "../../../../data/stcwCountries";
import sanctionedCountries from "../../../../data/sanctionedCountries";
import { CertificateData, RANK_DISPLAY_NAMES, requirements } from "../../../../data/rankDisplayName";

interface PersonalInfo {
  fullName: string;
  passport: string;
  nationality: string;
  cocFlag: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  currentRankText: string;
  totalExperience: string;
  lastVessel: string;
  vesselTypes: string;
  otherCurrentRank: string;
  currentRankDetail: string;
}

const nonSTCWCountries = ["other"];

const inputStyles = "w-full p-3 rounded-lg border-2 border-gray-300 text-sm transition-colors duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
const labelStyles = "block mb-1.5 font-semibold text-gray-700 text-sm";
const boxStyles = "bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200";
const formGridStyles = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5";
const photoGridStyles = "grid grid-cols-1 md:grid-cols-2 gap-5 mt-5";

const LiberiaForm: FC = () => {
  // ... (toda tu lógica de estado existente)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    passport: "",
    nationality: "",
    cocFlag: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    currentRankText: "",
    totalExperience: "",
    lastVessel: "",
    vesselTypes: "",
    otherCurrentRank: "",
    currentRankDetail: "",
  });
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [passportPhotoFile, setPassportPhotoFile] = useState<File | null>(null);
  const [rlm105File, setRlm105File] = useState<File | null>(null);
  const [selectedRank, setSelectedRank] = useState("");
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [comments, setComments] = useState("");
  const [confirmRequirements, setConfirmRequirements] = useState(false);
  const [cocStatus, setCocStatus] = useState<
    "ok" | "sanctioned" | "non_stcw" | "none"
  >("none");
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // --- NUEVO ESTADO PARA GESTIONAR EL ENVÍO ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ... (todos tus handlers existentes como handlePersonalInfoChange, handlePhotoUpload, etc.)
  const handlePersonalInfoChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [id]: value }));

    if (id === "cocFlag") {
      checkCOCEligibility(value);
    }
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "id" | "passport"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ File is too large. Maximum allowed size is 5MB.");
      e.target.value = "";
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("❌ File type not allowed. Only JPG and PNG files are accepted.");
      e.target.value = "";
      return;
    }

    if (type === "id") setIdPhotoFile(file);
    else setPassportPhotoFile(file);
  };

  const handleRemovePhoto = (type: "id" | "passport") => {
    if (type === "id") {
      setIdPhotoFile(null);
      (document.getElementById("idPhoto") as HTMLInputElement).value = "";
    } else {
      setPassportPhotoFile(null);
      (document.getElementById("passportPhoto") as HTMLInputElement).value = "";
    }
  };

  const handleRLM105Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("❌ File is too large. Maximum allowed size is 10MB.");
      e.target.value = "";
      return;
    }
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      alert(
        "❌ File type not allowed. Only PDF, JPG, and PNG files are accepted."
      );
      e.target.value = "";
      return;
    }
    setRlm105File(file);
  };

  const checkCOCEligibility = (country: string) => {
    if (sanctionedCountries.includes(country)) {
      setCocStatus("sanctioned");
      setSelectedRank(""); // Reset rank if COC is ineligible
      setCertificates([]);
      setTimeout(
        () =>
          alert(
            "⚠️ COC ELIGIBILITY NOTICE\n\n" +
              "The selected COC flag state is subject to comprehensive sanctions. " +
              "Liberia cannot process applications with certificates from this administration.\n\n" +
              "You must hold a valid Certificate of Competency from an approved STCW country to proceed.\n\n" +
              "Please contact the Training Center if you have questions about alternative documentation."
          ),
        500
      );
    } else if (nonSTCWCountries.includes(country)) {
      setCocStatus("non_stcw");
      setTimeout(
        () =>
          alert(
            "ℹ️ COC REVIEW REQUIRED\n\n" +
              "The selected country is not on the STCW approved list. " +
              "Your application will be subject to additional document review on a case-by-case basis.\n\n" +
              "Additional documents may be requested. Please contact the Training Center for guidance before proceeding.\n\n" +
              "Processing time may be extended for non-STCW approved certificates."
          ),
        500
      );
    } else {
      setCocStatus(country ? "ok" : "none");
    }
  };

  const handleRankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rank = e.target.value;
    if (cocStatus === "sanctioned") {
      alert(
        "⚠️ Please select an eligible COC flag state before proceeding with rank selection."
      );
      setSelectedRank("");
      return;
    }

    setSelectedRank(rank);
    if (rank && requirements[rank]) {
      const newCertificates = requirements[rank].courses.map((course) => ({
        ...course,
        file: null,
        certificateNumber: "",
        issueDate: "",
        expiryDate: "",
        issuingAuthority: "",
      }));
      setCertificates(newCertificates);
    } else {
      setCertificates([]);
    }
  };

  const handleCertificateChange = (
    index: number,
    field: keyof CertificateData,
    value: string | File
  ) => {
    const updatedCerts = [...certificates];
    updatedCerts[index] = { ...updatedCerts[index], [field]: value };
    setCertificates(updatedCerts);
  };

  const handleCertificateFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    handleCertificateChange(index, "file", file as File);
  };

  // Tu función de validación permanece igual
  const validateForm = useCallback(() => {
    const errs: string[] = [];
    if (!personalInfo.fullName.trim()) errs.push("Full name is required");
    if (!personalInfo.passport.trim()) errs.push("Passport number is required");
    if (!personalInfo.nationality.trim()) errs.push("Nationality is required");
    if (!personalInfo.cocFlag.trim()) errs.push("COC flag state is required");
    if (!personalInfo.email.trim()) errs.push("Email address is required");
    if (!personalInfo.currentRankText.trim())
      errs.push("Current rank is required");
    if (cocStatus === "sanctioned")
      errs.push("Selected COC flag state is not eligible due to sanctions");
    if (!idPhotoFile) errs.push("ID photo is required");
    if (!passportPhotoFile) errs.push("Passport photo is required");
    if (!rlm105File) errs.push("RLM-105 form must be uploaded");
    if (!selectedRank) errs.push("You must select a rank to apply for");

    certificates.forEach((cert) => {
      if (cert.required && !cert.file)
        errs.push(`Certificate must be uploaded for ${cert.courseName}`);
      if (cert.required && !cert.certificateNumber.trim())
        errs.push(`Certificate number required for ${cert.courseName}`);
    });

    if (!confirmRequirements)
      errs.push("You must confirm that you meet all requirements");

    return errs;
  }, [
    personalInfo,
    cocStatus,
    idPhotoFile,
    passportPhotoFile,
    rlm105File,
    selectedRank,
    certificates,
    confirmRequirements,
  ]);

  // --- FUNCIÓN handleSubmit TOTALMENTE NUEVA ---
  // En LiberiaForm.tsx

// En LiberiaForm.tsx

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const validationErrors = validateForm();
  if (validationErrors.length > 0) {
    setErrors(validationErrors);
    document.getElementById("errorsContainer")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  setErrors([]);
  setIsSubmitting(true);

  try {
    const formData = new FormData();
    
    // 1. Adjuntar datos de texto e información personal (esto ya estaba bien)
    Object.entries(personalInfo).forEach(([key, value]) => formData.append(key, value));
    formData.append("rankApplying", selectedRank);
    formData.append("comments", comments);

    // 2. Adjuntar archivos únicos (esto ya estaba bien)
    if (idPhotoFile) formData.append("idPhotoFile", idPhotoFile);
    if (passportPhotoFile) formData.append("passportPhotoFile", passportPhotoFile);
    if (rlm105File) formData.append("rlm105File", rlm105File);

    // 3. Adjuntar metadatos de certificados como JSON (esto ya estaba bien)
    const certsDataWithoutFiles = certificates.map(({ file, ...rest }) => rest);
    formData.append("certificatesMetadata", JSON.stringify(certsDataWithoutFiles)); // Renombré a 'certificatesMetadata' para mayor claridad

    // 4. ✨ LA SOLUCIÓN: Adjuntar cada archivo de certificado con una CLAVE ÚNICA ✨
    certificates.forEach((cert, index) => {
      if (cert.file) {
        // En lugar de "certificateFiles", usamos una clave única como "certificateFile_0", "certificateFile_1", etc.
        formData.append(`certificateFile_${index}`, cert.file);
      }
    });

    // Llamada a la server action (sin cambios)
    const result = await submitApplication(formData);

    if (!result.success) {
      throw new Error(result.message || 'El servidor devolvió un error inesperado.');
    }

    alert(`✅ Solicitud enviada con éxito!\nReferencia: ${result.applicationId}`);
    // Aquí iría una función para resetear el estado del formulario a sus valores iniciales.
    // e.target.reset() no es ideal con React.

  } catch (error) {
    const message = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
    setErrors([message]);
    document.getElementById("errorsContainer")?.scrollIntoView({ behavior: "smooth" });
  } finally {
    setIsSubmitting(false);
  }
};
  // Tu useEffect para la barra de progreso permanece igual
  useEffect(() => {
    const totalSteps = 6;
    let completedSteps = 0;

    if (
      personalInfo.fullName &&
      personalInfo.passport &&
      personalInfo.email &&
      personalInfo.nationality &&
      personalInfo.cocFlag
    ) {
      completedSteps++;
    }
    if (idPhotoFile && passportPhotoFile) {
      completedSteps++;
    }
    if (rlm105File) {
      completedSteps++;
    }
    if (selectedRank && cocStatus !== "sanctioned") {
      completedSteps++;
    }
    if (
      certificates.length > 0 &&
      certificates.every(
        (cert) => !cert.required || (cert.file && cert.certificateNumber)
      ) &&
      cocStatus !== "sanctioned"
    ) {
      completedSteps++;
    }
    if (confirmRequirements && cocStatus !== "sanctioned") {
      completedSteps++;
    }

    setProgress((completedSteps / totalSteps) * 100);
  }, [
    personalInfo,
    idPhotoFile,
    passportPhotoFile,
    rlm105File,
    selectedRank,
    certificates,
    confirmRequirements,
    cocStatus,
  ]);

  // --- El JSX permanece casi idéntico, solo actualizamos el botón de envío ---
  return (
    <div className="font-sans bg-gradient-to-br from-blue-50 to-gray-200 p-1 min-h-screen leading-relaxed">
      <div className="container max-w-7xl mx-auto">
        <h2 className="text-center text-blue-800 mb-8 text-3xl md:text-4xl font-bold text-shadow">
          🚢 Application Form for Examination - Liberian Officers
        </h2>

        <div className="bg-gray-200 h-1 rounded-full mb-5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-800 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Cambiamos la etiqueta <form> para usar nuestro nuevo handler */}
        <form onSubmit={handleSubmit}>
          {/* ... (todo tu JSX del formulario sin cambios) ... */}
          <div className={boxStyles}>
            <h3 className="text-xl text-gray-800 mb-5 font-bold border-b-2 border-blue-500 pb-2">
              👤 Applicant's Personal Information
            </h3>
            <div className={formGridStyles}>
              <div className="form-group">
                <label htmlFor="fullName" className={labelStyles}>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName" // Añadir name para FormData
                  value={personalInfo.fullName}
                  onChange={handlePersonalInfoChange}
                  placeholder="Full name"
                  className={inputStyles}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="passport" className={labelStyles}>
                  Passport Number *
                </label>
                <input
                  type="text"
                  id="passport"
                  name="passport" // Añadir name para FormData
                  value={personalInfo.passport}
                  onChange={handlePersonalInfoChange}
                  placeholder="e.g.: A1234567"
                  className={inputStyles}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nationality" className={labelStyles}>
                  Nationality *
                </label>
                <select
                  id="nationality"
                  name="nationality" // Añadir name para FormData
                  value={personalInfo.nationality}
                  onChange={handlePersonalInfoChange}
                  className={inputStyles}
                  required
                >
                  <option value="">-- Select your nationality --</option>
                  <optgroup label="STCW Approved Countries">
                    {stcwCountries.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Countries">
                    <option value="other">Other (Not STCW Approved)</option>
                  </optgroup>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="cocFlag" className={labelStyles}>
                  COC Flag State *
                </label>
                <select
                  id="cocFlag"
                  name="cocFlag" // Añadir name para FormData
                  value={personalInfo.cocFlag}
                  onChange={handlePersonalInfoChange}
                  className={inputStyles}
                  required
                >
                  <option value="">-- Select COC issuing country --</option>
                  <optgroup label="STCW Approved Countries">
                    {stcwCountries.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Sanctioned Countries (Not Eligible)">
                    {sanctionedCountries.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Countries">
                    <option value="other">Other (Not STCW Approved)</option>
                  </optgroup>
                </select>
                {cocStatus === "sanctioned" && (
                  <div className="bg-red-100 border-2 border-red-600 rounded-lg p-3 mt-2 text-red-800 font-semibold animate-shake">
                    <strong>⚠️ IMPORTANT NOTICE:</strong>
                    <br />
                    Liberia does not accept COCs from this country due to
                    sanctions. The Training Center cannot process this
                    application.
                  </div>
                )}
                {cocStatus === "non_stcw" && (
                  <div className="bg-blue-100 border border-blue-500 rounded-lg p-3 mt-2 text-blue-800 text-sm">
                    <strong>ℹ️ COC Information:</strong>
                    <br />
                    This country is not on the STCW approved list. Additional
                    documents may be requested.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className={labelStyles}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email" // Añadir name para FormData
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  placeholder="example@email.com"
                  className={inputStyles}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone" className={labelStyles}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone" // Añadir name para FormData
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  placeholder="+507 1234-5678"
                  className={inputStyles}
                />
              </div>
              <div className="form-group">
                <label htmlFor="birthDate" className={labelStyles}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate" // Añadir name para FormData
                  value={personalInfo.birthDate}
                  onChange={handlePersonalInfoChange}
                  className={inputStyles}
                />
              </div>
            </div>
            {/* ... Resto de los campos personales con el atributo 'name' ... */}
            <div className="form-group mb-5">
              <label htmlFor="address" className={labelStyles}>
                Complete Address
              </label>
              <textarea
                id="address"
                name="address"
                value={personalInfo.address}
                onChange={handlePersonalInfoChange}
                placeholder="Complete residential address"
                className={`${inputStyles} min-h-[100px]`}
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="form-group">
                <label htmlFor="currentRankText" className={labelStyles}>
                  Current Rank *
                </label>
                <input
                  type="text"
                  id="currentRankText"
                  name="currentRankText"
                  value={personalInfo.currentRankText}
                  onChange={handlePersonalInfoChange}
                  placeholder="e.g.: OS, NWO, etc."
                  className={inputStyles}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="totalExperience" className={labelStyles}>
                  Total Sea Experience
                </label>
                <input
                  type="text"
                  id="totalExperience"
                  name="totalExperience"
                  value={personalInfo.totalExperience}
                  onChange={handlePersonalInfoChange}
                  placeholder="e.g.: 5 years"
                  className={inputStyles}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastVessel" className={labelStyles}>
                  Last Vessel
                </label>
                <input
                  type="text"
                  id="lastVessel"
                  name="lastVessel"
                  value={personalInfo.lastVessel}
                  onChange={handlePersonalInfoChange}
                  placeholder="Name of last vessel"
                  className={inputStyles}
                />
              </div>
              <div className="form-group">
                <label htmlFor="vesselTypes" className={labelStyles}>
                  Vessel Types (Experience)
                </label>
                <input
                  type="text"
                  id="vesselTypes"
                  name="vesselTypes"
                  value={personalInfo.vesselTypes}
                  onChange={handlePersonalInfoChange}
                  placeholder="e.g.: Tanker, Container"
                  className={inputStyles}
                />
              </div>
            </div>

            {/* Photo & RLM sections here (no changes needed) */}
            <div className="photo-section bg-gray-50 border-2 border-gray-200 rounded-xl p-5 my-5">
              <h4 className="text-lg text-blue-800 mb-4 font-semibold flex items-center gap-2">
                📷 Required Photos
              </h4>
              <div className={photoGridStyles}>
                {/* ID Photo */}
                <div className="form-group">
                  <label htmlFor="idPhoto" className={labelStyles}>
                    ID Photo (1.75" x 1.75") *
                  </label>
                  <div
                    className={`relative border-2 border-dashed border-gray-300 rounded-lg p-5 text-center bg-white transition-all hover:border-blue-500 hover:bg-blue-50 ${idPhotoFile ? "border-green-500 bg-green-50" : ""}`}
                  >
                    <div className="text-4xl mb-2 text-gray-400">📸</div>
                    <p className="text-base font-semibold mb-2">
                      Upload ID photo
                    </p>
                    <p className="text-sm text-gray-500">JPG, PNG (Max 5MB)</p>
                    <input
                      type="file"
                      id="idPhoto"
                      name="idPhotoFile" // Añadir name
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handlePhotoUpload(e, "id")}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      required={!idPhotoFile}
                    />
                  </div>
                  {idPhotoFile && (
                    <div className="text-green-600 text-sm mt-2 flex items-center gap-2">
                      ✅ ID Photo uploaded: {idPhotoFile.name}{" "}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto("id")}
                        className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-md"
                      >
                        ❌ Remove
                      </button>
                    </div>
                  )}
                </div>
                {/* Passport Photo */}
                <div className="form-group">
                  <label htmlFor="passportPhoto" className={labelStyles}>
                    Passport Photo *
                  </label>
                  <div
                    className={`relative border-2 border-dashed border-gray-300 rounded-lg p-5 text-center bg-white transition-all hover:border-blue-500 hover:bg-blue-50 ${passportPhotoFile ? "border-green-500 bg-green-50" : ""}`}
                  >
                    <div className="text-4xl mb-2 text-gray-400">🛂</div>
                    <p className="text-base font-semibold mb-2">
                      Upload passport photo
                    </p>
                    <p className="text-sm text-gray-500">JPG, PNG (Max 5MB)</p>
                    <input
                      type="file"
                      id="passportPhoto"
                      name="passportPhotoFile" // Añadir name
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handlePhotoUpload(e, "passport")}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      required={!passportPhotoFile}
                    />
                  </div>
                  {passportPhotoFile && (
                    <div className="text-green-600 text-sm mt-2 flex items-center gap-2">
                      ✅ Passport Photo uploaded: {passportPhotoFile.name}{" "}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto("passport")}
                        className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-md"
                      >
                        ❌ Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rlm-section bg-blue-50 border-2 border-blue-500 rounded-xl p-5 my-5">
              <h4 className="text-lg text-blue-800 mb-4 font-semibold flex items-center gap-2">
                📋 Required RLM-105 Form
              </h4>
              <div className="instructions bg-amber-100 border border-amber-500 rounded-lg p-4 text-sm mb-4">
                <h5 className="font-bold text-amber-800 mb-2">
                  ⚠️ Important Instructions:
                </h5>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    <strong>Download</strong> the official RLM-105 form.
                  </li>
                  <li>
                    <strong>Complete</strong> all fields and{" "}
                    <strong>sign</strong> it.
                  </li>
                  <li>
                    <strong>Scan or photograph</strong> the completed document.
                  </li>
                  <li>
                    <strong>Upload</strong> the completed file below.
                  </li>
                </ol>
              </div>
              <div className="mb-4">
                <a
                  download
                  href={"/files/RLM-105_LISCR_APPLICATION_FORM.pdf"}
                  className="bg-gradient-to-br from-green-600 to-green-800 text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  📥 Download RLM-105 Form (PDF)
                </a>
              </div>
              <div className="upload-section mt-4 bg-white p-4 border rounded-lg">
                <label htmlFor="rlm105Upload" className={labelStyles}>
                  Upload Completed RLM-105 Form *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center bg-gray-50">
                  <input
                    type="file"
                    id="rlm105Upload"
                    name="rlm105File" // Añadir name
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleRLM105Upload}
                    className="text-sm"
                    required={!rlm105File}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    PDF, JPG, PNG (Max 10MB)
                  </p>
                </div>
                {rlm105File && (
                  <div className="text-green-600 text-sm mt-2 flex items-center gap-2">
                    ✅ RLM-105 Form uploaded: {rlm105File.name}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={boxStyles}>
            <h3 className="text-xl text-gray-800 mb-5 font-bold border-b-2 border-blue-500 pb-2">
              👨‍✈️ Rango Actual / Current Rank
            </h3>
            <div className="form-group">
              <label htmlFor="currentRankDetail" className={labelStyles}>
                Rango Actual *
              </label>
              <select
                id="currentRankDetail"
                name="currentRankDetail"
                value={personalInfo.currentRankDetail}
                onChange={handlePersonalInfoChange}
                className={inputStyles}
                required
              >
                <option value="">-- Seleccione su rango actual --</option>
                {Object.keys(RANK_DISPLAY_NAMES).map((key) => (
                  <option key={key} value={key}>
                    {RANK_DISPLAY_NAMES[key]}
                  </option>
                ))}
                <option value="other">Otro rango / Other rank</option>
              </select>
            </div>
            {personalInfo.currentRankDetail === "other" && (
              <div className="form-group mt-4">
                <label htmlFor="otherCurrentRank" className={labelStyles}>
                  Especifique su rango actual / Specify your current rank
                </label>
                <input
                  type="text"
                  id="otherCurrentRank"
                  name="otherCurrentRank"
                  placeholder="Escriba su rango actual"
                  value={personalInfo.otherCurrentRank}
                  onChange={handlePersonalInfoChange}
                  className={inputStyles}
                  required
                />
              </div>
            )}
          </div>
          {/* ... Resto del JSX del formulario ... */}
          {/* Rank Selection - MODIFICADO PARA MOSTRAR SOLO LOS 6 RANGOS */}
          <div className={boxStyles}>
            <h3 className="text-xl text-gray-800 mb-5 font-bold border-b-2 border-blue-500 pb-2">
              🎯 Rank You Wish to Apply For
            </h3>
            <div className="form-group">
              <label htmlFor="rank" className={labelStyles}>
                Select Rank *
              </label>
              <select
                id="rank"
                name="rank"
                value={selectedRank}
                onChange={handleRankChange}
                className={inputStyles}
                disabled={cocStatus === "sanctioned"}
                required
              >
                <option value="">-- Select a rank --</option>
                {Object.keys(RANK_DISPLAY_NAMES).map((key) => (
                  <option key={key} value={key}>
                    {RANK_DISPLAY_NAMES[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* ... */}
          // Busca esta parte en tu JSX:
{certificates.length > 0 && (
  <div className={boxStyles}>
    {/* ... */}
    <div className="space-y-5">
      {/* Reemplaza el contenido de este map con lo siguiente: */}
      {certificates.map((cert, index) => (
        <div
          key={index}
          className="cursoBox bg-gray-50 border-2 border-gray-200 rounded-lg p-5 hover:border-blue-500 transition-colors"
        >
          <h4 className="text-lg text-blue-800 font-semibold flex items-center gap-3 mb-3">
            📜 {cert.courseName}
            {cert.required && (
              <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                REQUIRED
              </span>
            )}
          </h4>
          <p className="text-gray-600 text-sm mb-4">
            {cert.description}
          </p>

          {/* --- CÓDIGO AÑADIDO / CORREGIDO --- */}
          {/* Este grid contiene los campos de texto para los detalles del certificado. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="form-group">
              <label className={labelStyles}>Certificate Number *</label>
              <input
                type="text"
                value={cert.certificateNumber}
                onChange={(e) => handleCertificateChange(index, "certificateNumber", e.target.value)}
                placeholder="e.g., C-12345"
                className={inputStyles}
                required={cert.required}
              />
            </div>
            <div className="form-group">
              <label className={labelStyles}>Issuing Authority</label>
              <input
                type="text"
                value={cert.issuingAuthority}
                onChange={(e) => handleCertificateChange(index, "issuingAuthority", e.target.value)}
                placeholder="e.g., Panama Maritime"
                className={inputStyles}
              />
            </div>
            <div className="form-group">
              <label className={labelStyles}>Issue Date</label>
              <input
                type="date"
                value={cert.issueDate}
                onChange={(e) => handleCertificateChange(index, "issueDate", e.target.value)}
                className={inputStyles}
              />
            </div>
            <div className="form-group">
              <label className={labelStyles}>Expiry Date</label>
              <input
                type="date"
                value={cert.expiryDate}
                onChange={(e) => handleCertificateChange(index, "expiryDate", e.target.value)}
                className={inputStyles}
              />
            </div>
          </div>
          {/* --- FIN DEL CÓDIGO AÑADIDO --- */}

          <div className="form-group mt-4">
            <label className={labelStyles}>
              Upload Certificate (PDF, JPG, PNG) {cert.required ? '*' : ''}
            </label>
            <div className="file-upload-area border-2 border-dashed border-gray-300 p-4 rounded-lg text-center bg-white">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleCertificateFileChange(index, e)}
                className="text-sm"
                required={cert.required && !cert.file} // La validación de archivo sigue aquí
              />
            </div>
            {cert.file && (
              <div className="text-green-600 text-sm mt-2">
                ✅ File uploaded: {cert.file.name}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

          {/* ----- SECCIÓN FINAL DE ENVÍO ----- */}
          {selectedRank && (
            <div className={boxStyles}>
              {/* ... (el resto del JSX como comentarios, checkbox y errores) ... */}

              <h3 className="text-xl text-gray-800 mb-5 font-bold border-b-2 border-blue-500 pb-2">
                💬 Additional Information
              </h3>
              <div className="form-group">
                <label htmlFor="comments" className={labelStyles}>
                  Comments or Additional Information
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter any additional relevant information..."
                  className={`${inputStyles} min-h-[100px]`}
                ></textarea>
              </div>
              <div className="checkbox-container bg-amber-100 border-l-4 border-amber-500 p-4 rounded-md my-5 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="checkRequirements"
                  checked={confirmRequirements}
                  onChange={(e) => setConfirmRequirements(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-blue-600"
                  required
                />
                <label
                  htmlFor="checkRequirements"
                  className="text-sm text-gray-700"
                >
                  I confirm that I meet all the mentioned requirements and have
                  attached all required documents, including the completed and
                  signed RLM-105 form, ID photo, and passport photo. The
                  information provided is truthful and complete. I understand
                  that my COC must be from an STCW approved nation or will be
                  subject to additional review.
                </label>
              </div>

              {errors.length > 0 && (
                <div
                  id="errorsContainer"
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
                  role="alert"
                >
                  <strong className="font-bold">
                    ⚠️ Please correct the following errors:
                  </strong>
                  <ul className="list-disc list-inside mt-2">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* --- BOTÓN DE ENVÍO ACTUALIZADO --- */}
              <button
                type="submit"
                disabled={isSubmitting} // Deshabilitado durante el envío
                className="w-full bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Submitting Application..."
                  : "📤 Submit Application"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LiberiaForm;
