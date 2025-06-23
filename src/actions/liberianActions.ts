"use server"

import { CertificateData } from "../data/rankDisplayName"

const { VITE_API_URL } = import.meta.env

export async function submitApplication(formData: FormData) {
  try {
    const personalInfo = {
      fullName: formData.get("fullName") as string,
      passport: formData.get("passport") as string,
      nationality: formData.get("nationality") as string,
      cocFlag: formData.get("cocFlag") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      birthDate: formData.get("birthDate") as string,
      address: formData.get("address") as string,
      currentRankText: formData.get("currentRankText") as string,
      totalExperience: formData.get("totalExperience") as string,
      lastVessel: formData.get("lastVessel") as string,
      vesselTypes: formData.get("vesselTypes") as string,
      otherCurrentRank: formData.get("otherCurrentRank") as string,
      currentRankDetail: formData.get("currentRankDetail") as string,
    }

    const rankApplying = formData.get("rankApplying") as string
    const comments = formData.get("comments") as string

    const idPhotoFile = formData.get("idPhotoFile") as File | null
    const passportPhotoFile = formData.get("passportPhotoFile") as File | null
    const rlm105File = formData.get("rlm105File") as File | null

    const certificatesJSON = formData.get("certificates") as string
    const certificateFiles = formData.getAll("certificateFiles") as File[]
    
    let certificates: CertificateData[] = []
    if (certificatesJSON) {
      const certificateData = JSON.parse(certificatesJSON) as Omit<CertificateData, 'file'>[]
      certificates = certificateData.map((certInfo, index) => ({
        ...certInfo,
        file: certificateFiles[index] || null,
      }))
    }

    // Objeto final con todos los datos listos para ser enviados a la API
    const finalPayload = {
      personalInfo,
      rankApplying,
      comments,
      idPhotoFile,
      passportPhotoFile,
      rlm105File,
      certificates,
    }

    console.log("✅ [SERVER ACTION] Datos recibidos en el servidor:")
    console.log("Personal Info:", finalPayload.personalInfo)
    console.log("Rank:", finalPayload.rankApplying)
    console.log("ID Photo:", finalPayload.idPhotoFile?.name, `(${finalPayload.idPhotoFile?.size} bytes)`)
    console.log("Certificates:", finalPayload.certificates)
    console.log("⏳ [SERVER ACTION] Enviando a la API externa...")
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const apiResponse = await fetch(`${VITE_API_URL}/api/liberian/send`, {
      method: 'POST',
      body: formData,
    });
    if (!apiResponse.ok) {
      throw new Error('La API devolvió un error.');
    }

    console.log("👍 [SERVER ACTION] Envío completado.")
    return {
      success: true,
      message: "Application submitted successfully!",
      applicationId: `APP-${Date.now()}`, // Ejemplo de dato devuelto
    }
  } catch (error) {
    console.error("❌ [SERVER ACTION] Error al procesar la aplicación:", error)
    return {
      success: false,
      message: "An unexpected error occurred on the server. Please try again.",
    }
  }
}