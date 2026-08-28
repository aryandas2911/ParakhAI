# PRODUCT REQUIREMENTS DOCUMENT (PRD)

Project: AI-Powered Legal Metrology Compliance Verification System
Problem Statement ID: 26034
Organization: Ministry of Consumer Affairs, Food & Public Distribution
Department: Department of Consumer Affairs (DoCA)
Category: Software
Theme: Agriculture, FoodTech & Rural Development

## 1. PRODUCT OVERVIEW

The proposed system is an AI-powered software application for checking compliance of packaged commodities with the Legal Metrology (Packaged Commodities) Rules, 2011. The system will scan product images and labels, extract mandatory declarations using OCR and AI, validate them using a rule-based compliance engine, identify violations, store supporting evidence, and generate digital compliance reports.

## 2. PROBLEM

Manual inspection of packaged commodities is time-consuming and resource-intensive. Products may contain missing, incorrect, misleading or improperly displayed mandatory declarations. There is a need for an automated system that can assist enforcement officials in quickly identifying potential non-compliance.

## 3. OBJECTIVES

- Automate extraction of mandatory declarations from product packaging.
- Validate declarations against applicable Legal Metrology requirements.
- Detect missing, incorrect or potentially non-compliant declarations.
- Analyze readability, font size and placement where technically feasible.
- Provide evidence-backed compliance results.
- Generate digital inspection reports.
- Maintain product and inspection history.
- Provide dashboards for monitoring compliance and enforcement activities.

## 4. TARGET USERS

- Legal Metrology enforcement officials
- Inspectors
- Department administrators
- Authorized reviewers

## 5. KEY FEATURES

### 5.1 Product Scanning
- Upload product/label images (single/multiple).
- Support multiple images of the same product.
- Store original images as inspection evidence.

### 5.2 OCR & Information Extraction
Extract relevant information such as:
- Product name
- MRP
- Net quantity
- Manufacturer/packer/importer details
- Date/month of manufacture, packing or import, as applicable
- Consumer-care details
- Other applicable mandatory declarations

### 5.3 Compliance Checking
- Detect presence or absence of required declarations.
- Validate extracted values and formats.
- Check applicable requirements using a rule-based engine.
- Identify potential non-compliance.
- Provide rule/reference information for detected issues.

### 5.4 Visual Analysis
- Analyze text readability.
- Estimate character/font size where possible.
- Check declaration visibility and placement where technically feasible.
- Highlight relevant regions in the image.

### 5.5 Evidence Management
- Store original product photographs.
- Store highlighted/cropped evidence.
- Link evidence to individual violations.
- Maintain inspection date, user and product information.

### 5.6 Reports
Generate:
- Compliance reports
- Non-compliance/violation reports
- Product inspection summaries
- PDF reports
- Editable reports

### 5.7 Dashboard
Display:
- Total inspections
- Compliant products
- Non-compliant products
- Violation categories
- Recent inspections
- Product compliance history
- Inspection trends

### 5.8 Search & Repository
- Search previously scanned products.
- Retrieve inspection records and reports.
- View historical compliance results.
- Search/filter by product, date, status or violation type.

### 5.9 Authentication & Roles
- Secure login.
- Role-based access.
- Administrator and enforcement-user permissions.
- Secure storage of inspection data.

## 6. USER WORKFLOW

Login
→ Create Inspection
→ Upload/Capture Product Images
→ Image Preprocessing
→ OCR & Label Analysis
→ Extract Declarations
→ Apply Legal Rules
→ Detect Potential Violations
→ Review Results & Evidence
→ Generate Report
→ Save Inspection
→ Dashboard/History

## 7. SYSTEM ARCHITECTURE

Frontend
- Web-based Mobile-first UI / responsive interface for tablets and desktops
- Product scanning/upload
- Inspection results
- Dashboard
- Reports and history

Backend
- REST/API services
- Authentication and authorization
- Inspection management
- Compliance processing
- Report generation

AI/CV Layer
- Image preprocessing
- OCR
- Text/field extraction
- Label/region detection
- Readability and font analysis

Compliance Layer
- Structured Legal Metrology rules database
- Deterministic validation rules
- Product/category-specific applicability
- Violation classification

Database & Storage
- User records
- Product records
- Inspection history
- Extracted declarations
- Compliance results
- Evidence images
- Generated reports

## 8. FUNCTIONAL REQUIREMENTS

FR-01: The system shall allow authorized users to upload product images.
FR-02: The system shall process and extract text from uploaded images.
FR-03: The system shall identify relevant mandatory declarations.
FR-04: The system shall validate extracted declarations using predefined legal rules.
FR-05: The system shall identify missing or potentially non-compliant declarations.
FR-06: The system shall provide supporting visual evidence for detected issues.
FR-07: The system shall generate compliance reports.
FR-08: The system shall maintain inspection history.
FR-09: The system shall provide search and filtering functionality.
FR-10: The system shall provide a monitoring dashboard.
FR-11: The system shall support role-based access.
FR-12: The system shall allow reports to be exported in PDF and editable formats.

## 9. NON-FUNCTIONAL REQUIREMENTS

- Accuracy: Provide reliable OCR and rule-validation results.
- Performance: Process normal product images within an acceptable response time.
- Security: Protect user, inspection and evidence data.
- Scalability: Support increasing products, users and inspection records.
- Usability: Provide a simple interface suitable for field inspectors.
- Reliability: Preserve inspection records and evidence.
- Maintainability: Use modular architecture for future rule/model updates.

## 10. TECHNOLOGY DIRECTION

Possible technology stack:

Frontend:
- Next.js/TailwindCSS

Backend:
- Python FastAPI / Django

AI & Computer Vision:
- OpenCV
- OCR engine such as PaddleOCR/Tesseract
- Object detection/vision models where required
- NLP/LLM for assisted information extraction

Database:
- PostgreSQL

Storage:
- Local/Object storage for images and reports

Reports:
- PDF and editable document generation

Deployment:
- Docker
- Cloud or institutional server

## 11. COMPLIANCE RULE ENGINE

The system should maintain legal requirements as structured rules rather than relying solely on an LLM. Each rule can contain:

- Rule/reference ID
- Applicable product/category
- Required declaration
- Validation condition
- Violation type
- Evidence requirement
- Severity/priority
- Version/effective date

The final implementation must be validated against the current official Legal Metrology requirements.

## 12. OUTPUT

For every inspection, the system should provide:

- Product details
- Extracted declarations
- Compliance status
- Detected violations
- Applicable rule/reference
- Confidence/verification indicators
- Highlighted evidence
- Inspection details
- Downloadable report

## 13. DEVELOPMENT ROADMAP

Phase 1 – Research:
Study the problem, rules, mandatory declarations and existing solutions.

Phase 2 – Dataset:
Collect and organize compliant/non-compliant product label images.

Phase 3 – AI Pipeline:
Implement image preprocessing, OCR, label detection and information extraction.

Phase 4 – Compliance Engine:
Convert applicable legal requirements into structured validation rules.

Phase 5 – Application:
Develop frontend, backend, authentication, database and inspection workflow.

Phase 6 – Reports & Dashboard:
Implement evidence management, dashboards and PDF/editable report generation.

Phase 7 – Integration & Testing:
Integrate all modules and test on diverse real-world packaging images.

Phase 8 – Deployment:
Deploy the prototype, document architecture and prepare SIH demonstration.

## 14. SUCCESS CRITERIA

- Mandatory declarations are extracted with useful accuracy.
- Applicable rules are correctly mapped to extracted declarations.
- Potential violations are identified with supporting evidence.
- Inspectors can complete an inspection through a simple workflow.
- Reports can be generated automatically.
- Previous inspections can be searched and retrieved.
- Dashboard provides meaningful compliance statistics.
- System is modular enough to update rules and AI models.

## 15. MVP SCOPE

The first working prototype should focus on:
- Product image upload
- OCR
- Extraction of major mandatory declarations
- Rule-based validation
- Basic font/readability analysis
- Violation highlighting
- Compliance score/status
- Inspection history
- Dashboard
- PDF report generation

Advanced features such as mobile camera integration, e-commerce listing analysis, advanced vision models and large-scale deployment can be added after the MVP.

## 17. IMPORTANT IMPLEMENTATION NOTE

The system is intended as a compliance-assistance tool. Legal conclusions should be based on the applicable and current official provisions and should allow authorized officials to review AI-generated findings before taking enforcement action.
