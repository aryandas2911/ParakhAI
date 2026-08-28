export interface ReportHistoryItem {
  id: string;
  reportId: string;
  product: string;
  manufacturer: string;
  category: "Packaged Food" | "Household" | "Edible Oil" | "Beverages";
  status: "Non-Compliant" | "Compliant" | "Requires Review";
  inspector: string;
  date: string;
  findings: string;
  findingsSeverity: "violations" | "review" | "none";
  confidence: number;
  violationTypes: string[];
}

export const REPORTS_REPOSITORY_DATA: ReportHistoryItem[] = [
  {
    id: "LM-CE-2026-0042",
    reportId: "RPT-LM-CE-2026-0042",
    product: "Premium Basmati Rice",
    manufacturer: "Aarav Foods Pvt. Ltd.",
    category: "Packaged Food",
    status: "Non-Compliant",
    inspector: "J. Smith",
    date: "2026-07-20",
    findings: "3 potential violations",
    findingsSeverity: "violations",
    confidence: 96,
    violationTypes: ["Consumer Care", "MRP Format", "Net Quantity"],
  },
  {
    id: "LM-CE-2026-0041",
    reportId: "RPT-LM-CE-2026-0041",
    product: "Whole Wheat Flour",
    manufacturer: "Bharat Grain Mills",
    category: "Packaged Food",
    status: "Compliant",
    inspector: "A. Davis",
    date: "2026-07-19",
    findings: "None",
    findingsSeverity: "none",
    confidence: 98,
    violationTypes: [],
  },
  {
    id: "LM-CE-2026-0040",
    reportId: "RPT-LM-CE-2026-0040",
    product: "Premium Tea",
    manufacturer: "Nilgiri Agro Teas",
    category: "Packaged Food",
    status: "Requires Review",
    inspector: "M. Patel",
    date: "2026-07-18",
    findings: "1 potential violation",
    findingsSeverity: "review",
    confidence: 84,
    violationTypes: ["Font Size"],
  },
  {
    id: "LM-CE-2026-0039",
    reportId: "RPT-LM-CE-2026-0039",
    product: "Refined Cooking Oil",
    manufacturer: "SunGold Agro Ltd.",
    category: "Packaged Food",
    status: "Non-Compliant",
    inspector: "J. Smith",
    date: "2026-07-17",
    findings: "2 potential violations",
    findingsSeverity: "violations",
    confidence: 92,
    violationTypes: ["MRP Format", "Mandatory Declarations"],
  },
  {
    id: "LM-CE-2026-0038",
    reportId: "RPT-LM-CE-2026-0038",
    product: "Iodized Salt 1kg",
    manufacturer: "Coastal Refineries",
    category: "Packaged Food",
    status: "Compliant",
    inspector: "A. Davis",
    date: "2026-07-16",
    findings: "None",
    findingsSeverity: "none",
    confidence: 99,
    violationTypes: [],
  },
  {
    id: "LM-CE-2026-0037",
    reportId: "RPT-LM-CE-2026-0037",
    product: "Detergent Powder 2kg",
    manufacturer: "CleanHome Products",
    category: "Household",
    status: "Requires Review",
    inspector: "M. Patel",
    date: "2026-07-15",
    findings: "1 potential violation",
    findingsSeverity: "review",
    confidence: 81,
    violationTypes: ["Net Quantity"],
  },
];
