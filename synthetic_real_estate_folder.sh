#!/bin/bash

# Script to create a synthetic directory structure for a single small real estate deal
# with at least 120 documents inside

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Main directory name - customize as needed
MAIN_DIR="123_Main_Street_Deal"

echo -e "${GREEN}Creating real estate deal directory structure with 120+ documents for: ${BLUE}$MAIN_DIR${NC}"

# Create main directory
mkdir -p "$MAIN_DIR"

# Create subdirectories
mkdir -p "$MAIN_DIR/1_Purchase_Agreement"
mkdir -p "$MAIN_DIR/2_Due_Diligence"
mkdir -p "$MAIN_DIR/2_Due_Diligence/Property_Inspection"
mkdir -p "$MAIN_DIR/2_Due_Diligence/Environmental"
mkdir -p "$MAIN_DIR/2_Due_Diligence/Financial_Records"
mkdir -p "$MAIN_DIR/2_Due_Diligence/Title_Search"
mkdir -p "$MAIN_DIR/2_Due_Diligence/Zoning"
mkdir -p "$MAIN_DIR/2_Due_Diligence/Building_Code"
mkdir -p "$MAIN_DIR/2_Due_Diligence/Permits"
mkdir -p "$MAIN_DIR/3_Financing"
mkdir -p "$MAIN_DIR/3_Financing/Loan_Documents"
mkdir -p "$MAIN_DIR/3_Financing/Bank_Statements"
mkdir -p "$MAIN_DIR/3_Financing/Credit_Reports"
mkdir -p "$MAIN_DIR/3_Financing/Financial_Statements"
mkdir -p "$MAIN_DIR/3_Financing/Lender_Correspondence"
mkdir -p "$MAIN_DIR/4_Closing_Documents"
mkdir -p "$MAIN_DIR/5_Insurance"
mkdir -p "$MAIN_DIR/6_Property_Management"
mkdir -p "$MAIN_DIR/6_Property_Management/Tenant_Files"
mkdir -p "$MAIN_DIR/6_Property_Management/Maintenance_Records"
mkdir -p "$MAIN_DIR/6_Property_Management/Service_Contracts"
mkdir -p "$MAIN_DIR/7_Tax_Documents"
mkdir -p "$MAIN_DIR/8_Communications"
mkdir -p "$MAIN_DIR/8_Communications/Agent"
mkdir -p "$MAIN_DIR/8_Communications/Seller"
mkdir -p "$MAIN_DIR/8_Communications/Lender"
mkdir -p "$MAIN_DIR/8_Communications/Attorney"
mkdir -p "$MAIN_DIR/9_Photos_and_Plans"
mkdir -p "$MAIN_DIR/10_Utilities"
mkdir -p "$MAIN_DIR/11_Legal"
mkdir -p "$MAIN_DIR/12_HOA_Documents"

# Document counter to track how many we've created
DOC_COUNT=0

# Function to create a file and increment the counter
create_file() {
    touch "$1"
    ((DOC_COUNT++))
    echo -e "Created document #${DOC_COUNT}: ${1}"
}

# 1. Purchase Agreement
create_file "$MAIN_DIR/1_Purchase_Agreement/Purchase_Agreement_Signed.pdf"
create_file "$MAIN_DIR/1_Purchase_Agreement/Addendum_1.pdf"
create_file "$MAIN_DIR/1_Purchase_Agreement/Addendum_2.pdf"
create_file "$MAIN_DIR/1_Purchase_Agreement/Addendum_3_Contingencies.pdf"
create_file "$MAIN_DIR/1_Purchase_Agreement/Escrow_Receipt.pdf"
create_file "$MAIN_DIR/1_Purchase_Agreement/Seller_Disclosure.pdf"
create_file "$MAIN_DIR/1_Purchase_Agreement/Buyer_Disclosure.pdf"
create_file "$MAIN_DIR/1_Purchase_Agreement/Counter_Offer_1.pdf"
create_file "$MAIN_DIR/1_Purchase_Agreement/Counter_Offer_2.pdf"
create_file "$MAIN_DIR/1_Purchase_Agreement/Final_Acceptance.pdf"

# 2. Due Diligence
# Property Inspection
create_file "$MAIN_DIR/2_Due_Diligence/Property_Inspection/General_Inspection_Report.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Property_Inspection/HVAC_Inspection.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Property_Inspection/Plumbing_Inspection.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Property_Inspection/Electrical_Inspection.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Property_Inspection/Roof_Inspection.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Property_Inspection/Foundation_Inspection.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Property_Inspection/Repair_Estimates.xlsx"
create_file "$MAIN_DIR/2_Due_Diligence/Property_Inspection/Inspector_Notes.docx"
create_file "$MAIN_DIR/2_Due_Diligence/Property_Inspection/Inspector_Qualifications.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Property_Inspection/Inspection_Photos.zip"

# Environmental
create_file "$MAIN_DIR/2_Due_Diligence/Environmental/Phase_1_Environmental_Report.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Environmental/Asbestos_Test_Results.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Environmental/Lead_Paint_Assessment.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Environmental/Radon_Test_Results.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Environmental/Mold_Inspection.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Environmental/Soil_Contamination_Report.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Environmental/Water_Quality_Test.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Environmental/Environmental_Questionnaire.pdf"

# Financial Records
create_file "$MAIN_DIR/2_Due_Diligence/Financial_Records/Rent_Roll.xlsx"
create_file "$MAIN_DIR/2_Due_Diligence/Financial_Records/Operating_Expenses_3yr.xlsx"
create_file "$MAIN_DIR/2_Due_Diligence/Financial_Records/Income_Statement_2023.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Financial_Records/Income_Statement_2022.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Financial_Records/Income_Statement_2021.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Financial_Records/Utility_Bills_Electric.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Financial_Records/Utility_Bills_Water.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Financial_Records/Utility_Bills_Gas.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Financial_Records/Property_Tax_History.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Financial_Records/CAM_Reconciliations.xlsx"

# Title Search
create_file "$MAIN_DIR/2_Due_Diligence/Title_Search/Preliminary_Title_Report.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Title_Search/Chain_of_Title.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Title_Search/Easement_Documents.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Title_Search/Encroachment_Survey.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Title_Search/Liens_Search_Results.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Title_Search/Title_Commitment.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Title_Search/Title_Exceptions.pdf"

# Zoning
create_file "$MAIN_DIR/2_Due_Diligence/Zoning/Zoning_Verification_Letter.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Zoning/Zoning_Map.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Zoning/Use_Restrictions.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Zoning/Variance_History.pdf"

# Building Code
create_file "$MAIN_DIR/2_Due_Diligence/Building_Code/Building_Code_Compliance.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Building_Code/Certificate_of_Occupancy.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Building_Code/Building_Violations.pdf"

# Permits
create_file "$MAIN_DIR/2_Due_Diligence/Permits/Building_Permits.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Permits/Renovation_Permits.pdf"
create_file "$MAIN_DIR/2_Due_Diligence/Permits/Historical_Permits.pdf"

# 3. Financing
create_file "$MAIN_DIR/3_Financing/Loan_Application.pdf"
create_file "$MAIN_DIR/3_Financing/Term_Sheet.pdf"
create_file "$MAIN_DIR/3_Financing/Appraisal_Report.pdf"
create_file "$MAIN_DIR/3_Financing/Commitment_Letter.pdf"
create_file "$MAIN_DIR/3_Financing/Good_Faith_Estimate.pdf"

# Loan Documents
create_file "$MAIN_DIR/3_Financing/Loan_Documents/Promissory_Note.pdf"
create_file "$MAIN_DIR/3_Financing/Loan_Documents/Deed_of_Trust.pdf"
create_file "$MAIN_DIR/3_Financing/Loan_Documents/Loan_Agreement.pdf"
create_file "$MAIN_DIR/3_Financing/Loan_Documents/Escrow_Agreement.pdf"
create_file "$MAIN_DIR/3_Financing/Loan_Documents/Riders.pdf"
create_file "$MAIN_DIR/3_Financing/Loan_Documents/Loan_Disclosures.pdf"

# Bank Statements
create_file "$MAIN_DIR/3_Financing/Bank_Statements/Jan2024_Statement.pdf"
create_file "$MAIN_DIR/3_Financing/Bank_Statements/Feb2024_Statement.pdf"
create_file "$MAIN_DIR/3_Financing/Bank_Statements/Mar2024_Statement.pdf"
create_file "$MAIN_DIR/3_Financing/Bank_Statements/Deposit_Verification.pdf"

# Credit Reports
create_file "$MAIN_DIR/3_Financing/Credit_Reports/Credit_Report_Equifax.pdf"
create_file "$MAIN_DIR/3_Financing/Credit_Reports/Credit_Report_Experian.pdf"
create_file "$MAIN_DIR/3_Financing/Credit_Reports/Credit_Report_TransUnion.pdf"

# Financial Statements
create_file "$MAIN_DIR/3_Financing/Financial_Statements/Balance_Sheet.pdf"
create_file "$MAIN_DIR/3_Financing/Financial_Statements/Income_Statement.pdf"
create_file "$MAIN_DIR/3_Financing/Financial_Statements/Cash_Flow_Statement.pdf"
create_file "$MAIN_DIR/3_Financing/Financial_Statements/Net_Worth_Statement.pdf"

# Lender Correspondence
create_file "$MAIN_DIR/3_Financing/Lender_Correspondence/Initial_Inquiry.pdf"
create_file "$MAIN_DIR/3_Financing/Lender_Correspondence/Rate_Lock_Confirmation.pdf"
create_file "$MAIN_DIR/3_Financing/Lender_Correspondence/Underwriting_Questions.pdf"

# 4. Closing Documents
create_file "$MAIN_DIR/4_Closing_Documents/Settlement_Statement.pdf"
create_file "$MAIN_DIR/4_Closing_Documents/Deed.pdf"
create_file "$MAIN_DIR/4_Closing_Documents/Bill_of_Sale.pdf"
create_file "$MAIN_DIR/4_Closing_Documents/Closing_Disclosure.pdf"
create_file "$MAIN_DIR/4_Closing_Documents/Key_Transfer.pdf"
create_file "$MAIN_DIR/4_Closing_Documents/Affidavit_of_Title.pdf"
create_file "$MAIN_DIR/4_Closing_Documents/1099_S_Form.pdf"
create_file "$MAIN_DIR/4_Closing_Documents/Transfer_Tax_Documents.pdf"

# 5. Insurance
create_file "$MAIN_DIR/5_Insurance/Property_Insurance_Policy.pdf"
create_file "$MAIN_DIR/5_Insurance/Flood_Insurance.pdf"
create_file "$MAIN_DIR/5_Insurance/Liability_Insurance.pdf"
create_file "$MAIN_DIR/5_Insurance/Insurance_Quotes.xlsx"
create_file "$MAIN_DIR/5_Insurance/Insurance_Binder.pdf"
create_file "$MAIN_DIR/5_Insurance/Claims_History.pdf"
create_file "$MAIN_DIR/5_Insurance/Insurance_Agent_Contact.pdf"

# 6. Property Management
create_file "$MAIN_DIR/6_Property_Management/Management_Agreement.pdf"
create_file "$MAIN_DIR/6_Property_Management/Property_Rules_and_Regulations.pdf"
create_file "$MAIN_DIR/6_Property_Management/Emergency_Contact_List.pdf"

# Tenant Files
create_file "$MAIN_DIR/6_Property_Management/Tenant_Files/Tenant_Leases.pdf"
create_file "$MAIN_DIR/6_Property_Management/Tenant_Files/Tenant_Application.pdf"
create_file "$MAIN_DIR/6_Property_Management/Tenant_Files/Tenant_Screening.pdf"
create_file "$MAIN_DIR/6_Property_Management/Tenant_Files/Security_Deposit_Records.pdf"
create_file "$MAIN_DIR/6_Property_Management/Tenant_Files/Tenant_Correspondence.pdf"

# Maintenance Records
create_file "$MAIN_DIR/6_Property_Management/Maintenance_Records/Maintenance_Schedule.xlsx"
create_file "$MAIN_DIR/6_Property_Management/Maintenance_Records/Repair_History.pdf"
create_file "$MAIN_DIR/6_Property_Management/Maintenance_Records/Maintenance_Requests.pdf"
create_file "$MAIN_DIR/6_Property_Management/Maintenance_Records/Equipment_Warranties.pdf"

# Service Contracts
create_file "$MAIN_DIR/6_Property_Management/Service_Contracts/Lawn_Service_Contract.pdf"
create_file "$MAIN_DIR/6_Property_Management/Service_Contracts/Cleaning_Service_Contract.pdf"
create_file "$MAIN_DIR/6_Property_Management/Service_Contracts/HVAC_Service_Contract.pdf"
create_file "$MAIN_DIR/6_Property_Management/Service_Contracts/Pest_Control_Contract.pdf"
create_file "$MAIN_DIR/6_Property_Management/Service_Contracts/Vendor_Contracts.pdf"

# 7. Tax Documents
create_file "$MAIN_DIR/7_Tax_Documents/Property_Tax_Bill.pdf"
create_file "$MAIN_DIR/7_Tax_Documents/Depreciation_Schedule.xlsx"
create_file "$MAIN_DIR/7_Tax_Documents/Tax_Returns_2023.pdf"
create_file "$MAIN_DIR/7_Tax_Documents/1099_Forms.pdf"
create_file "$MAIN_DIR/7_Tax_Documents/Property_Tax_Assessment.pdf"
create_file "$MAIN_DIR/7_Tax_Documents/Tax_Abatement_Documents.pdf"
create_file "$MAIN_DIR/7_Tax_Documents/Cost_Segregation_Study.pdf"

# 8. Communications
# Agent
create_file "$MAIN_DIR/8_Communications/Agent/Agent_Emails.pdf"
create_file "$MAIN_DIR/8_Communications/Agent/Agent_Agreement.pdf"
create_file "$MAIN_DIR/8_Communications/Agent/Commission_Agreement.pdf"

# Seller
create_file "$MAIN_DIR/8_Communications/Seller/Seller_Negotiations.docx"
create_file "$MAIN_DIR/8_Communications/Seller/Seller_Disclosures.pdf"
create_file "$MAIN_DIR/8_Communications/Seller/Seller_Information.pdf"

# Lender
create_file "$MAIN_DIR/8_Communications/Lender/Lender_Communications.pdf"
create_file "$MAIN_DIR/8_Communications/Lender/Loan_Officer_Notes.pdf"

# Attorney
create_file "$MAIN_DIR/8_Communications/Attorney/Attorney_Correspondence.pdf"
create_file "$MAIN_DIR/8_Communications/Attorney/Legal_Opinion.pdf"
create_file "$MAIN_DIR/8_Communications/Attorney/Title_Review.pdf"

# 9. Photos and Plans
create_file "$MAIN_DIR/9_Photos_and_Plans/Property_Photos.zip"
create_file "$MAIN_DIR/9_Photos_and_Plans/Floor_Plans.pdf"
create_file "$MAIN_DIR/9_Photos_and_Plans/Site_Survey.pdf"
create_file "$MAIN_DIR/9_Photos_and_Plans/Renovation_Plans.pdf"
create_file "$MAIN_DIR/9_Photos_and_Plans/Exterior_Photos.jpg"
create_file "$MAIN_DIR/9_Photos_and_Plans/Interior_Photos.jpg"
create_file "$MAIN_DIR/9_Photos_and_Plans/Virtual_Tour_Link.html"
create_file "$MAIN_DIR/9_Photos_and_Plans/Plat_Map.pdf"
create_file "$MAIN_DIR/9_Photos_and_Plans/Topographical_Survey.pdf"

# 10. Utilities
create_file "$MAIN_DIR/10_Utilities/Electric_Service.pdf"
create_file "$MAIN_DIR/10_Utilities/Water_Service.pdf"
create_file "$MAIN_DIR/10_Utilities/Gas_Service.pdf"
create_file "$MAIN_DIR/10_Utilities/Internet_Service.pdf"
create_file "$MAIN_DIR/10_Utilities/Utility_Transfer_Forms.pdf"
create_file "$MAIN_DIR/10_Utilities/Utility_Deposit_Receipts.pdf"

# 11. Legal
create_file "$MAIN_DIR/11_Legal/Entity_Formation_Documents.pdf"
create_file "$MAIN_DIR/11_Legal/Operating_Agreement.pdf"
create_file "$MAIN_DIR/11_Legal/Partnership_Agreement.pdf"
create_file "$MAIN_DIR/11_Legal/Power_of_Attorney.pdf"
create_file "$MAIN_DIR/11_Legal/Legal_Compliance_Checklist.pdf"

# 12. HOA Documents
create_file "$MAIN_DIR/12_HOA_Documents/HOA_Bylaws.pdf"
create_file "$MAIN_DIR/12_HOA_Documents/HOA_CC_and_Rs.pdf"
create_file "$MAIN_DIR/12_HOA_Documents/HOA_Financial_Statements.pdf"
create_file "$MAIN_DIR/12_HOA_Documents/HOA_Meeting_Minutes.pdf"
create_file "$MAIN_DIR/12_HOA_Documents/HOA_Dues_Schedule.pdf"
create_file "$MAIN_DIR/12_HOA_Documents/HOA_Approval_Letter.pdf"

# Add a README file
cat > "$MAIN_DIR/README.md" << EOL
# 123 Main Street Real Estate Deal
## Document Structure

This directory contains all documents related to the purchase, due diligence, and management of the property at 123 Main Street.

### Directory Structure
1. **Purchase Agreement** - Signed agreements and related documents
2. **Due Diligence** - Inspection reports, environmental assessments, financial records, title search, zoning, building code, permits
3. **Financing** - Loan applications, documents, bank statements, credit reports, financial statements
4. **Closing Documents** - Settlement statements, deed, and other closing paperwork
5. **Insurance** - Insurance policies and related documents
6. **Property Management** - Management agreements, leases, tenant files, maintenance records
7. **Tax Documents** - Property tax information and tax returns
8. **Communications** - Correspondence with agents, sellers, lenders, attorneys
9. **Photos and Plans** - Property photos, floor plans, and renovation designs
10. **Utilities** - Utility service agreements and transfer documents
11. **Legal** - Entity formation and legal compliance documents
12. **HOA Documents** - Homeowners Association documentation

**Total Documents**: ${DOC_COUNT}

Last Updated: March 2025
EOL

echo -e "${GREEN}Directory structure created successfully!${NC}"
echo -e "${BLUE}Total number of documents created: ${DOC_COUNT}${NC}"
echo -e "Navigate to the directory with: ${BLUE}cd $MAIN_DIR${NC}"