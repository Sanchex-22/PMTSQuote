// requirementsData.ts

export interface CertificateData {
  // Exporta la interfaz para usarla en actions.ts
  courseName: string;
  description: string;
  required: boolean;
  file?: File | null;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
}

// Asegúrate de importar CertificateData si está en otro archivo

// Tipado del objeto requirements
export const requirements: Record<
  string,
  {
    previous: string;
    experience: string;
    courses: Omit<
      CertificateData,
      | "file"
      | "certificateNumber"
      | "issueDate"
      | "expiryDate"
      | "issuingAuthority"
    >[];
  }
> = {
  oowd: {
    previous: "Graduate from recognized nautical school",
    experience:
      "3 years of service (max. 2 years in school) + 6 months supervised practice",
    courses: [
      {
        courseName: "Basic Training",
        required: true,
        description: "Basic maritime safety training",
      },
      {
        courseName: "Radar Observer / ARPA",
        required: true,
        description: "Radar observer and ARPA",
      },
      {
        courseName: "Advanced Firefighting",
        required: true,
        description: "Advanced firefighting",
      },
      {
        courseName: "Survival Craft",
        required: true,
        description: "Survival craft handling",
      },
      {
        courseName: "GMDSS",
        required: true,
        description: "Global Maritime Distress and Safety System",
      },
      {
        courseName: "Bridge Resource Management",
        required: true,
        description: "Bridge resource management",
      },
      {
        courseName: "ECDIS",
        required: true,
        description: "Electronic Chart Display and Information System",
      },
      {
        courseName: "Security Awareness",
        required: true,
        description: "Security awareness",
      },
    ],
  },
  chiefMate: {
    previous: "Officer in Charge of a Navigational Watch",
    experience: "2 years as OOWD",
    courses: [
      {
        courseName: "Basic Training",
        required: true,
        description: "Basic maritime safety training",
      },
      {
        courseName: "Advanced Firefighting",
        required: true,
        description: "Advanced firefighting",
      },
      {
        courseName: "Medical Care",
        required: true,
        description: "Medical care on board",
      },
      {
        courseName: "Survival Craft",
        required: true,
        description: "Survival craft handling",
      },
      {
        courseName: "GMDSS",
        required: true,
        description: "Global Maritime Distress and Safety System",
      },
      {
        courseName: "Bridge Resource Management",
        required: true,
        description: "Bridge resource management",
      },
      {
        courseName: "ECDIS",
        required: true,
        description: "Electronic Chart Display and Information System",
      },
      {
        courseName: "Security Awareness",
        required: true,
        description: "Security awareness",
      },
    ],
  },
  master: {
    previous: "Chief Mate II/2",
    experience: "1 year as Chief Mate",
    courses: [
      {
        courseName: "Basic Training",
        required: true,
        description: "Basic maritime safety training",
      },
      {
        courseName: "Advanced Firefighting",
        required: true,
        description: "Advanced firefighting",
      },
      {
        courseName: "Medical Care",
        required: true,
        description: "Medical care on board",
      },
      {
        courseName: "Survival Craft",
        required: true,
        description: "Survival craft handling",
      },
      {
        courseName: "GMDSS",
        required: true,
        description: "Global Maritime Distress and Safety System",
      },
      {
        courseName: "Bridge Resource Management",
        required: true,
        description: "Bridge resource management",
      },
      {
        courseName: "ECDIS",
        required: true,
        description: "Electronic Chart Display and Information System",
      },
      {
        courseName: "Security Awareness",
        required: true,
        description: "Security awareness",
      },
    ],
  },
  oowe: {
    previous: "30-month approved course + practice",
    experience: "6 months supervised in engine room",
    courses: [
      {
        courseName: "Basic Training",
        required: true,
        description: "Basic maritime safety training",
      },
      {
        courseName: "Advanced Firefighting",
        required: true,
        description: "Advanced firefighting",
      },
      {
        courseName: "Survival Craft",
        required: true,
        description: "Survival craft handling",
      },
      {
        courseName: "High Voltage",
        required: true,
        description: "High voltage handling",
      },
      {
        courseName: "Engine Resource Management",
        required: true,
        description: "Engine resource management",
      },
      {
        courseName: "Security Awareness",
        required: true,
        description: "Security awareness",
      },
    ],
  },
  secondEng: {
    previous: "Officer in Charge of an Engineering Watch",
    experience: "2 years as OOWE",
    courses: [
      {
        courseName: "Basic Training",
        required: true,
        description: "Basic maritime safety training",
      },
      {
        courseName: "Advanced Firefighting",
        required: true,
        description: "Advanced firefighting",
      },
      {
        courseName: "Medical Care",
        required: true,
        description: "Medical care on board",
      },
      {
        courseName: "Survival Craft",
        required: true,
        description: "Survival craft handling",
      },
      {
        courseName: "High Voltage",
        required: true,
        description: "High voltage handling",
      },
      {
        courseName: "Engine Resource Management",
        required: true,
        description: "Engine resource management",
      },
      {
        courseName: "Security Awareness",
        required: true,
        description: "Security awareness",
      },
    ],
  },
  chiefEng: {
    previous: "2nd Engineer III/2",
    experience: "1 year as Second Engineer",
    courses: [
      {
        courseName: "Basic Training",
        required: true,
        description: "Basic maritime safety training",
      },
      {
        courseName: "Advanced Firefighting",
        required: true,
        description: "Advanced firefighting",
      },
      {
        courseName: "Medical Care",
        required: true,
        description: "Medical care on board",
      },
      {
        courseName: "Survival Craft",
        required: true,
        description: "Survival craft handling",
      },
      {
        courseName: "High Voltage",
        required: true,
        description: "High voltage handling",
      },
      {
        courseName: "Engine Resource Management",
        required: true,
        description: "Engine resource management",
      },
      {
        courseName: "Security Awareness",
        required: true,
        description: "Security awareness",
      },
    ],
  },
};

// Nombres amigables para mostrar en UI
export const RANK_DISPLAY_NAMES: Record<string, string> = {
  oowd: "Officer in Charge of a Navigational Watch (OOWD II/1)",
  chiefMate: "Chief Mate II/2",
  master: "Master II/2",
  oowe: "Officer in Charge of an Engineering Watch (OOWE III/1)",
  secondEng: "2nd Engineer III/2",
  chiefEng: "Chief Engineer III/2",
};
