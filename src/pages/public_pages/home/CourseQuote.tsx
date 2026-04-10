"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { submitRegistration } from "../../../actions/actions"
import Images from "../../../assets"
import countryNationality from "../../../data/countries"
import { PrivacyModal } from "../../../components/modals/PrivacyModal"
import { TermsModal } from "../../../components/modals/TermsModal"
import { Course, CourseServices } from "../../../services/courses"
import { UserIcon, DocumentIcon, GlobeIcon, MailIcon, PhoneIcon, LoadingSpinner, BackIcon, CheckIcon } from "../../../components/icons/icons"
import { governments, calculateCoursePrice, calculateRenewalPrice } from "../../../utils/pricing"
import { CourseSelector } from "./components/course-selector"
import CourseRenewalSelector from "../../../components/buttons/course-renewal-selector"
import { QuoteSummary } from "./components/quote-summary"
import { SimpleCheckboxCaptcha } from "../../../components/forms/SimpleCheckboxCaptcha"
import { CustomCheckbox } from "../../../components/forms/custom-checkbox"
import { CustomButton } from "../../../components/forms/custom-button"
import { CustomInput } from "../../../components/forms/customInput"
import { CustomSelect } from "../../../components/forms/custom-select"

interface RegistrationResult {
  courses: Course[]
  renewalCourses: Course[]
  studentInfo: { name: string; lastName: string; document: string; nationality: string; email: string; phone: string }
  totalCost: number; newCoursesTotal: number; renewalCoursesTotal: number; government: string
}

const countryOptions = countryNationality.map(([country]) => ({ label: country, value: country }))

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{children}</p>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>⚠</span>{msg}</p>
}

export default function CourseQuote() {
  const { t } = useTranslation()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiCourses, setApiCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [errorCourses, setErrorCourses] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", lastName: "", document: "", nationality: "", email: "", phone: "", courses: [] as string[], renewalCourses: [] as string[], government: "" })
  const [registration, setRegistration] = useState<RegistrationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [coursesTermsAccepted, setCoursesTermsAccepted] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)

  useEffect(() => {
    new CourseServices().getAllCourses()
      .then(setApiCourses)
      .catch(() => setErrorCourses(t("Failed to load courses.")))
      .finally(() => setLoadingCourses(false))
  }, [])

  const handleInputChange = (field: string, value: string | string[]) => {
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    setFormData(prev => {
      const next = { ...prev, [field]: value, ...(field === "government" && { courses: [], renewalCourses: [] }) }
      if (field === "courses" && Array.isArray(value)) next.renewalCourses = prev.renewalCourses.filter(id => !value.includes(id))
      if (field === "renewalCourses" && Array.isArray(value)) next.courses = prev.courses.filter(id => !value.includes(id))
      return next
    })
  }

  const calculateCosts = () => {
    const nc = apiCourses.filter(c => formData.courses.includes(String(c.id)))
    const rc = apiCourses.filter(c => formData.renewalCourses.includes(String(c.id)))
    const nct = nc.reduce((s, c) => s + calculateCoursePrice(c, formData.nationality, formData.government), 0)
    const rct = rc.reduce((s, c) => s + calculateRenewalPrice(c, formData.nationality, formData.government), 0)
    return { selectedNewCoursesData: nc, selectedRenewalCoursesData: rc, newCoursesTotal: nct, renewalCoursesTotal: rct, totalCost: nct + rct }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const e2: Record<string, string> = {}
    if (!formData.government) e2.government = t("Please select a government/institution")
    if (!formData.nationality) e2.nationality = t("Please select your nationality")
    if (formData.courses.length === 0 && formData.renewalCourses.length === 0) e2.courses = t("Please select at least one course")
    if (!captchaVerified) e2.captcha = t("Please verify you are not a robot")
    if (!termsAccepted) e2.terms = t("You must accept the terms and conditions")
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    setIsLoading(true)
    try {
      await submitRegistration(formData)
      const { selectedNewCoursesData, selectedRenewalCoursesData, newCoursesTotal, renewalCoursesTotal, totalCost } = calculateCosts()
      setRegistration({ courses: selectedNewCoursesData, renewalCourses: selectedRenewalCoursesData, studentInfo: { name: formData.name, lastName: formData.lastName, document: formData.document, nationality: formData.nationality, email: formData.email, phone: formData.phone }, totalCost, newCoursesTotal, renewalCoursesTotal, government: governments.find(g => g.value === formData.government)?.label || formData.government })
      setShowConfirmation(true)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : t("There was an error submitting your quote") })
    } finally {
      setIsLoading(false)
    }
  }

  const canSeeCoursePicker = formData.nationality && formData.government
  const hasCoursesSelected = formData.courses.length > 0 || formData.renewalCourses.length > 0

  // ── Confirmation ──
  if (showConfirmation && registration) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-2xl mb-4 shadow-lg text-white">
              <CheckIcon />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">{t("Quote Generated!")}</h1>
            <p className="text-gray-500 text-sm mt-1">{t("Your quote has been generated successfully")}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-green-50 px-5 py-4 border-b border-green-100 text-center">
              <p className="text-sm font-medium text-green-800">{t("Please check your email to see the full quote.")}</p>
            </div>

            <div className="p-5 space-y-4">
              {registration.courses.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t("New Courses")}</p>
                  <div className="space-y-2">
                    {registration.courses.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-blue-900 flex-1 min-w-0 truncate">{c.name}</span>
                        {c.abbr && <span className="text-xs font-mono text-blue-500 bg-white px-2 py-0.5 rounded-lg border border-blue-100 flex-shrink-0">{c.abbr}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {registration.renewalCourses.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t("Renewals")}</p>
                  <div className="space-y-2">
                    {registration.renewalCourses.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-orange-900 flex-1 min-w-0 truncate">{c.name}</span>
                        {c.abbr && <span className="text-xs font-mono text-orange-500 bg-white px-2 py-0.5 rounded-lg border border-orange-100 flex-shrink-0">{c.abbr}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t("Student Details")}</p>
                {[
                  [t("Full name"), `${registration.studentInfo.name} ${registration.studentInfo.lastName}`],
                  [t("Document"), registration.studentInfo.document],
                  [t("Nationality"), registration.studentInfo.nationality],
                  [t("Email"), registration.studentInfo.email],
                  [t("Phone"), registration.studentInfo.phone || "—"],
                  [t("Government"), registration.government],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-gray-400 flex-shrink-0">{label}</span>
                    <span className="font-medium text-gray-800 text-right break-all">{val}</span>
                  </div>
                ))}
              </div>

              <CustomButton onClick={() => { setShowConfirmation(false); setRegistration(null) }} variant="secondary">
                <BackIcon /> {t("New Quote")}
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Main form ──
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-0 sm:px-4 py-0 sm:py-8">
      <div className="w-full max-w-lg">
        <div className="bg-white sm:rounded-3xl sm:shadow-xl sm:border sm:border-gray-100 overflow-hidden min-h-screen sm:min-h-0">

          {/* Header */}
          <div className="px-5 pt-10 pb-6 text-center bg-gradient-to-b from-blue-50 to-white border-b border-gray-100">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg mb-4">
              <img src={Images.logo || "/placeholder.svg"} alt="logo" width={48} height={48} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">{t("Course Quote")}</h1>
            <p className="text-sm text-gray-500">{t("Fill out the form to generate your quote")}</p>
          </div>

          <form onSubmit={handleSubmit} className="px-5 pt-6 pb-8 space-y-7">

            {/* — Personal Info — */}
            <section className="space-y-4">
              <SectionLabel>{t("Personal Information")}</SectionLabel>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("Name")} <span className="text-red-400">*</span></label>
                  <CustomInput id="name" value={formData.name} onChange={v => handleInputChange("name", v)} placeholder={t("Your name")} required icon={<UserIcon />} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("Last Name")} <span className="text-red-400">*</span></label>
                  <CustomInput id="lastName" value={formData.lastName} onChange={v => handleInputChange("lastName", v)} placeholder={t("Your last name")} required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("ID or Passport")} <span className="text-red-400">*</span></label>
                <CustomInput id="document" value={formData.document} onChange={v => handleInputChange("document", v)} placeholder={t("Document number")} required icon={<DocumentIcon />} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("Nationality")} <span className="text-red-400">*</span></label>
                <CustomSelect value={formData.nationality} onChange={v => handleInputChange("nationality", v)} placeholder={t("Select your nationality")} options={countryOptions} icon={<GlobeIcon />} />
                <FieldError msg={errors.nationality} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("Email")} <span className="text-red-400">*</span></label>
                  <CustomInput id="email" type="email" value={formData.email} onChange={v => handleInputChange("email", v)} placeholder="you@email.com" icon={<MailIcon />} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("Phone")}</label>
                  <CustomInput id="phone" type="tel" value={formData.phone} onChange={v => handleInputChange("phone", v)} placeholder="+1 (123) 456-7890" icon={<PhoneIcon />} />
                </div>
              </div>
            </section>

            <div className="h-px bg-gray-100" />

            {/* — Course Selection — */}
            <section className="space-y-4">
              <SectionLabel>{t("Course Selection")}</SectionLabel>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("Government/Institution")} <span className="text-red-400">*</span></label>
                <CustomSelect value={formData.government} onChange={v => handleInputChange("government", v)} placeholder={t("Select the government/institution")} options={governments} icon={<GlobeIcon />} />
                <FieldError msg={errors.government} />
              </div>

              {canSeeCoursePicker ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("New Maritime Courses")}
                      <span className="text-gray-400 font-normal text-xs ml-1">{t("(Search by name, abbreviation or IMO)")}</span>
                    </label>
                    <CourseSelector
                      selectedCourses={formData.courses}
                      onChange={c => handleInputChange("courses", c)}
                      government={formData.government}
                      nationality={formData.nationality}
                      renewalCourses={formData.renewalCourses}
                      availableCourses={apiCourses}
                      loading={loadingCourses}
                      error={errorCourses}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("Course Renewal")}
                      <span className="text-gray-400 font-normal text-xs ml-1">{t("(Only courses that allow renewal)")}</span>
                    </label>
                    <CourseRenewalSelector
                      selectedCourses={formData.renewalCourses}
                      onChange={c => handleInputChange("renewalCourses", c)}
                      government={formData.government}
                      availableCourses={apiCourses}
                      loading={loadingCourses}
                      error={errorCourses}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-sm text-gray-400">
                  <span className="text-xl">📋</span>
                  {!formData.nationality
                    ? t("Select your nationality first to see available courses")
                    : t("Select a government/institution to see available courses")}
                </div>
              )}

              <FieldError msg={errors.courses} />

              {canSeeCoursePicker && hasCoursesSelected && (
                <QuoteSummary
                  selectedCourses={formData.courses}
                  selectedRenewalCourses={formData.renewalCourses}
                  government={formData.government}
                  nationality={formData.nationality}
                  availableCourses={apiCourses}
                />
              )}
            </section>

            <div className="h-px bg-gray-100" />

            {/* — Verification & Terms — */}
            <section className="space-y-4">
              <SectionLabel>{t("Verification")}</SectionLabel>

              <div>
                <SimpleCheckboxCaptcha verified={captchaVerified} onVerify={setCaptchaVerified} />
                <FieldError msg={errors.captcha} />
              </div>

              <div className="space-y-3.5">
                <CustomCheckbox id="terms" checked={termsAccepted}
                  onChange={v => { setTermsAccepted(v); setErrors(p => { const n = { ...p }; delete n.terms; return n }) }}
                  required
                  label={
                    <span>
                      {t("I accept the")}{" "}
                      <button type="button" onClick={() => setTermsOpen(true)} className="text-orange-500 hover:text-orange-700 underline font-medium">{t("terms and conditions")}</button>
                      {" "}{t("and the")}{" "}
                      <button type="button" onClick={() => setPrivacyOpen(true)} className="text-orange-500 hover:text-orange-700 underline font-medium">{t("privacy policy")}</button>
                    </span>
                  }
                />
                <FieldError msg={errors.terms} />

                <CustomCheckbox id="courses-terms" checked={coursesTermsAccepted} onChange={setCoursesTermsAccepted} required
                  label={t("I agree that these courses are 100% in-person")}
                />
              </div>
            </section>

            {errors.submit && (
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
                <span className="flex-shrink-0 mt-0.5">⚠</span> {errors.submit}
              </div>
            )}

            <CustomButton
              type="submit"
              disabled={isLoading || !captchaVerified || !termsAccepted || !coursesTermsAccepted || !hasCoursesSelected || !formData.nationality || !formData.government || apiCourses.length === 0}
              variant="primary"
            >
              {isLoading ? <><LoadingSpinner />{t("Generating quote...")}</> : t("Generate Quote")}
            </CustomButton>

          </form>
        </div>
      </div>

      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  )
}
