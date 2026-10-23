---
'@hintoric/email': minor
---

New `CompanyDataFoundEmail` / `renderCompanyDataFound`: tells someone that their company details were found on the website behind their mail domain and invites them to review them. One sentence ("Auf muster-bau.de wurden die Angaben zu Muster Bau GmbH gefunden."), a button to the prefilled company settings page, and the note that nothing is taken over before they confirm. The individual fields are not listed. `companyName` is optional — without it the texts speak of "your company". German and English messages (`companyDataFoundMessagesDe` / `…En`).
